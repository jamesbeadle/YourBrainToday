import {
	CatmullRomCurve3,
	Group,
	Mesh,
	type BufferGeometry,
	type MeshBasicMaterial,
	type Texture,
	type Vector3
} from 'three';
import { axonPathOf } from '../constellation/axonPath';
import { fibreGeometryFrom } from '../constellation/fibreGeometry';
import { strandHeadingsOf } from '../constellation/synapseHeadings';
import { pathwayTints } from './pathwayTints';
import { createSynapseBouton } from './synapseBouton';
import type { CellMaterialBank } from '../constellation/cellMaterialBank';
import type { Synapse } from '../constellation/constellationTypes';
import type { FlowEdge, FlowEdgeKind } from './flowTypes';

const RADIAL_SEGMENTS = 6;
const PULSE_SAMPLE_COUNT = 40;
const STUB_END_RADIUS = 0.006;
export const FLOW_CONTEXT_KEY = 'flow';
export const GAP_CONTEXT_KEY = 'gaps';
const FIBRE_RADIUS_BY_KIND: Record<FlowEdgeKind, number> = {
	flow: 0.0035,
	handover: 0.0042,
	deadEnd: 0.002,
	orphan: 0.002
};

export type FlowPathway = {
	group: Group;
	edge: FlowEdge;
	pulsePoints: Vector3[];
	hitTarget: Mesh | null;
	light: (isHovered: boolean) => void;
	dispose: () => void;
};

export type PathwaySupplies = {
	hitGeometry: BufferGeometry;
	hitMaterial: MeshBasicMaterial;
	glowTexture: Texture;
	cells: CellMaterialBank;
	somaRadiusFor: (nodeId: string) => number;
	colourFor: (nodeId: string) => number;
};

export function createFlowPathway(edge: FlowEdge, supplies: PathwaySupplies): FlowPathway {
	const strand: Synapse = {
		kind: edge.kind === 'handover' ? 'crosslink' : 'dendrite',
		contextSlug: null,
		fromSlug: edge.fromId,
		toSlug: edge.toId,
		from: edge.from,
		to: edge.to
	};
	const path = axonPathOf(strand, strandHeadingsOf(strand), {
		fromSomaRadius: edge.kind === 'orphan' ? STUB_END_RADIUS : supplies.somaRadiusFor(edge.fromId),
		toSomaRadius: edge.kind === 'deadEnd' ? STUB_END_RADIUS : supplies.somaRadiusFor(edge.toId),
		fibreRadius: FIBRE_RADIUS_BY_KIND[edge.kind]
	});
	const geometry = fibreGeometryFrom(path, RADIAL_SEGMENTS);
	const tints = pathwayTints(edge, supplies.colourFor(edge.fromId), supplies.colourFor(edge.toId));
	const contextKey = edge.kind === 'orphan' || edge.kind === 'deadEnd' ? GAP_CONTEXT_KEY : FLOW_CONTEXT_KEY;
	const fibre = new Mesh(geometry, supplies.cells.axonFor(edge.id, tints, contextKey));
	const pulsePoints = new CatmullRomCurve3(path.points).getSpacedPoints(PULSE_SAMPLE_COUNT);
	const group = new Group();
	group.add(fibre);

	const synapse = edge.kind === 'handover' ? createSynapseBouton(edge, pulsePoints, supplies) : null;
	if (synapse !== null) group.add(synapse.bouton, synapse.hitTarget);

	function light(isHovered: boolean): void {
		synapse?.light(isHovered);
	}

	function dispose(): void {
		geometry.dispose();
		synapse?.dispose();
	}

	return { group, edge, pulsePoints, hitTarget: synapse?.hitTarget ?? null, light, dispose };
}
