import { Group, type Texture } from 'three';
import { createCometMaterials, createPulseComet, type PulseComet } from '../constellation/pulseComet';
import type { FlowEdge, FlowModel } from './flowTypes';
import type { FlowField } from './flowField';

const SPAWN_INTERVAL_SECONDS = 0.8;
const TOKEN_LIMIT = 36;
const TRAVEL_UNITS_PER_SECOND = 1.5;
const SHORTEST_TRIP_SECONDS = 0.35;

type Token = { comet: PulseComet; edge: FlowEdge; progress: number; tripSeconds: number };

export type TokenTraffic = { group: Group; update: (deltaSeconds: number) => void; dispose: () => void };

export function createTokenTraffic(model: FlowModel, field: FlowField, glowTexture: Texture): TokenTraffic {
	const group = new Group();
	const materials = createCometMaterials(glowTexture);
	const springs = model.edges.filter((edge) => isSpring(edge, model));
	let tokens: Token[] = [];
	let sinceSpawnSeconds = SPAWN_INTERVAL_SECONDS;

	function board(edge: FlowEdge, comet: PulseComet): Token {
		comet.settleOn(edge.colour);
		comet.group.visible = true;
		return { comet, edge, progress: 0, tripSeconds: tripSecondsFor(edge) };
	}

	function spawn(): void {
		if (springs.length === 0 || tokens.length >= TOKEN_LIMIT) return;
		const edge = springs[Math.floor(Math.random() * springs.length)];
		const comet = createPulseComet(materials);
		group.add(comet.group);
		tokens.push(board(edge, comet));
	}

	function travelOn(token: Token): Token | null {
		field.excite(token.edge.toId);
		const onwards = field.edgesLeaving(token.edge.toId);
		if (onwards.length === 0) return null;
		return board(onwards[Math.floor(Math.random() * onwards.length)], token.comet);
	}

	function update(deltaSeconds: number): void {
		sinceSpawnSeconds += deltaSeconds;
		if (sinceSpawnSeconds >= SPAWN_INTERVAL_SECONDS) {
			sinceSpawnSeconds = 0;
			spawn();
		}
		tokens = tokens.flatMap((token) => {
			token.progress += deltaSeconds / token.tripSeconds;
			if (token.progress < 1) {
				token.comet.placeAlong(field.pulsePointsOf(token.edge.id), token.progress);
				return [token];
			}
			const onward = travelOn(token);
			if (onward !== null) return [onward];
			group.remove(token.comet.group);
			return [];
		});
	}

	return { group, update, dispose: materials.dispose };
}

function isSpring(edge: FlowEdge, model: FlowModel): boolean {
	if (edge.kind === 'orphan') return true;
	const from = model.nodes.find((node) => node.id === edge.fromId);
	return from?.kind === 'source';
}

function tripSecondsFor(edge: FlowEdge): number {
	return Math.max(SHORTEST_TRIP_SECONDS, edge.from.distanceTo(edge.to) / TRAVEL_UNITS_PER_SECOND);
}
