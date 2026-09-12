import { Vector3 } from 'three';
import { isInsideBrain } from '../constellation/brainShape';
import { shareStreamFrom } from '../constellation/pseudoRandom';
import type { FlowLane, FlowNode } from './flowTypes';

const LANE_TOP = 1.5;
const LANE_BOTTOM = -1.2;
const FRONT_Z = 2.9;
const BACK_Z = -2.7;
const SOURCE_Z = 4.4;
const SINK_Z = -4.2;
const ROOT_Z_STAGGER = 0.5;
const CLEAR_OF_FISSURE = 0.45;
const SIDE_STEP = 0.5;
const SIDE_JITTER = 0.3;
const ROW_COUNT = 3;
const ROW_SHARE = 0.3;
const SLOT_FILL_SHARE = 0.9;
const SETTLE_SHARE = 0.85;
const SETTLE_ATTEMPT_LIMIT = 8;

type Slot = { nodes: FlowNode[]; depth: number };

export function laneCentres(roleCount: number): number[] {
	if (roleCount <= 1) return [(LANE_TOP + LANE_BOTTOM) / 2];
	return Array.from({ length: roleCount }, (_, index) => {
		return LANE_TOP - ((LANE_TOP - LANE_BOTTOM) * index) / (roleCount - 1);
	});
}

export function placeNodes(
	nodes: FlowNode[],
	depths: Map<string, number>,
	lanes: FlowLane[],
	seedText: string
): void {
	const nextShare = shareStreamFrom(`${seedText}:flow`);
	const stationDepths = nodes.filter((node) => node.kind === 'station').map((node) => depths.get(node.id) ?? 1);
	const deepest = Math.max(1, ...stationDepths);
	const bandHeight = (LANE_TOP - LANE_BOTTOM) / Math.max(1, lanes.length);
	for (const slot of slotsOf(nodes, depths)) {
		slot.nodes.forEach((node, index) => {
			const laneHeight = lanes[node.roleIndex]?.laneHeight ?? 0;
			const row = (index % ROW_COUNT) - Math.floor(ROW_COUNT / 2);
			const side = sideOffset(index) + (nextShare() - 0.5) * SIDE_JITTER;
			const height = laneHeight + row * bandHeight * ROW_SHARE;
			node.position.set(side, height, zFor(node, slot, index, deepest));
			if (node.kind === 'station') settleInsideBrain(node.position);
		});
	}
}

function slotsOf(nodes: FlowNode[], depths: Map<string, number>): Slot[] {
	const slots = new Map<string, Slot>();
	for (const node of nodes) {
		const depth = depths.get(node.id) ?? 1;
		const key = node.kind === 'station' ? `station:${node.roleIndex}:${depth}` : `${node.kind}:${node.roleIndex}`;
		const slot = slots.get(key) ?? { nodes: [], depth };
		slot.nodes.push(node);
		slots.set(key, slot);
	}
	return [...slots.values()];
}

function zFor(node: FlowNode, slot: Slot, index: number, deepest: number): number {
	const stagger = (index % 2) * ROOT_Z_STAGGER;
	if (node.kind === 'source') return SOURCE_Z + stagger;
	if (node.kind === 'sink') return SINK_Z - stagger;
	const span = FRONT_Z - BACK_Z;
	const slotWidth = deepest === 1 ? span : span / (deepest - 1);
	const centre = deepest === 1 ? (FRONT_Z + BACK_Z) / 2 : FRONT_Z - ((slot.depth - 1) / (deepest - 1)) * span;
	const spread = ((index + 0.5) / slot.nodes.length - 0.5) * slotWidth * SLOT_FILL_SHARE;
	return centre - spread;
}

function sideOffset(index: number): number {
	const hand = index % 2 === 0 ? 1 : -1;
	return hand * (CLEAR_OF_FISSURE + Math.floor(index / 4) * SIDE_STEP);
}

function settleInsideBrain(position: Vector3): void {
	for (let attempt = 0; attempt < SETTLE_ATTEMPT_LIMIT; attempt += 1) {
		if (isInsideBrain(position)) return;
		position.x *= SETTLE_SHARE;
		position.y *= SETTLE_SHARE;
	}
}
