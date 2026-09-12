import { Vector3 } from 'three';
import { GAP_TINT } from './flowPalette';
import type { EdgeSeed } from './flowEdges';
import type { FlowEdge, FlowNode } from './flowTypes';

const ORPHAN_STUB = new Vector3(0.1, 0.22, 0.42);
const DEAD_END_STUB = new Vector3(-0.1, -0.18, -0.42);

export function stubSeed(station: FlowNode, artefact: string, kind: 'orphan' | 'deadEnd'): EdgeSeed {
	const stubId = `${kind}:${station.id}`;
	return {
		id: stubId,
		kind,
		artefact,
		fromId: kind === 'orphan' ? stubId : station.id,
		toId: kind === 'orphan' ? station.id : stubId,
		failureNote: '',
		colour: GAP_TINT
	};
}

export function placedStub(seed: EdgeSeed, station: Vector3 | undefined): FlowEdge {
	const anchor = station ?? new Vector3();
	if (seed.kind === 'orphan') return { ...seed, from: anchor.clone().add(ORPHAN_STUB), to: anchor };
	return { ...seed, from: anchor, to: anchor.clone().add(DEAD_END_STUB) };
}
