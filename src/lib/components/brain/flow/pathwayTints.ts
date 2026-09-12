import { GAP_TINT, SYNAPSE_TINT } from './flowPalette';
import type { FibreTints } from '../constellation/fibreMaterial';
import type { FlowEdge } from './flowTypes';

export function pathwayTints(edge: FlowEdge, fromColour: number, toColour: number): FibreTints {
	if (edge.kind === 'handover') return { root: fromColour, span: SYNAPSE_TINT, tip: toColour };
	if (edge.kind === 'orphan') return { root: GAP_TINT, span: GAP_TINT, tip: toColour };
	if (edge.kind === 'deadEnd') return { root: fromColour, span: GAP_TINT, tip: GAP_TINT };
	return { root: fromColour, span: fromColour, tip: toColour };
}
