import { Group, IcosahedronGeometry, Mesh, MeshBasicMaterial, Vector3, type Texture } from 'three';
import { createFlowPathway, GAP_CONTEXT_KEY, type FlowPathway } from './flowPathway';
import { createFlowStation, somaRadiusForNode, type FlowStation } from './flowStation';
import { createLaneDressing } from './laneDressing';
import { GAP_TINT } from './flowPalette';
import type { MaterialBank } from '../constellation/materialBank';
import type { CellMaterialBank } from '../constellation/cellMaterialBank';
import type { FlowEdge, FlowHover, FlowModel } from './flowTypes';

const SOMA_DETAIL = 3;
const HIT_DETAIL = 1;
const GAP_BRIGHTNESS = 0.55;

export type FlowField = {
	group: Group;
	hitTargets: Mesh[];
	edgesLeaving: (nodeId: string) => FlowEdge[];
	pulsePointsOf: (edgeId: string) => Vector3[];
	excite: (nodeId: string) => void;
	setHover: (hover: Pick<FlowHover, 'nodeId' | 'edgeId'> | null) => void;
	update: (timeSeconds: number, deltaSeconds: number) => void;
	dispose: () => void;
};

export function createFlowField(
	model: FlowModel,
	glowTexture: Texture,
	bank: MaterialBank,
	cells: CellMaterialBank
): FlowField {
	const somaGeometry = new IcosahedronGeometry(1, SOMA_DETAIL);
	const hitGeometry = new IcosahedronGeometry(1, HIT_DETAIL);
	const hitMaterial = new MeshBasicMaterial({ visible: false });
	const nodesById = new Map(model.nodes.map((node) => [node.id, node]));
	const group = new Group();
	const lanes = createLaneDressing(model.lanes, glowTexture);
	group.add(lanes.group);

	const stations = new Map<string, FlowStation>();
	for (const node of model.nodes) {
		const station = createFlowStation(node, { somaGeometry, hitGeometry, hitMaterial, bank, cells });
		stations.set(node.id, station);
		group.add(station.group);
	}
	const pathwaySupplies = {
		hitGeometry,
		hitMaterial,
		glowTexture,
		cells,
		somaRadiusFor: (nodeId: string) => somaRadiusForNode(nodesById.get(nodeId) ?? model.nodes[0]),
		colourFor: (nodeId: string) => nodesById.get(nodeId)?.colour ?? GAP_TINT
	};
	const pathways = new Map<string, FlowPathway>();
	cells.setBrightness(GAP_CONTEXT_KEY, GAP_BRIGHTNESS);
	for (const edge of model.edges) {
		const pathway = createFlowPathway(edge, pathwaySupplies);
		pathways.set(edge.id, pathway);
		group.add(pathway.group);
	}
	let hovered: Pick<FlowHover, 'nodeId' | 'edgeId'> | null = null;

	function update(timeSeconds: number, deltaSeconds: number): void {
		for (const station of stations.values()) {
			station.light(station.node.id === hovered?.nodeId, timeSeconds, deltaSeconds);
		}
		for (const pathway of pathways.values()) pathway.light(pathway.edge.id === hovered?.edgeId);
	}

	function dispose(): void {
		for (const station of stations.values()) station.dispose();
		for (const pathway of pathways.values()) pathway.dispose();
		lanes.dispose();
		somaGeometry.dispose();
		hitGeometry.dispose();
		hitMaterial.dispose();
	}

	return {
		group,
		hitTargets: [
			...[...stations.values()].map((station) => station.hitTarget),
			...[...pathways.values()].flatMap((pathway) => (pathway.hitTarget === null ? [] : [pathway.hitTarget]))
		],
		edgesLeaving: (nodeId) => model.edges.filter((edge) => edge.fromId === nodeId),
		pulsePointsOf: (edgeId) => pathways.get(edgeId)?.pulsePoints ?? [],
		excite: (nodeId) => stations.get(nodeId)?.excite(),
		setHover: (hover) => (hovered = hover),
		update,
		dispose
	};
}
