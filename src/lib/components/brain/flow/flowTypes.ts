import type { Vector3 } from 'three';

export type FlowNodeKind = 'station' | 'source' | 'sink';

export type FlowNode = {
	id: string;
	kind: FlowNodeKind;
	name: string;
	roleName: string;
	roleIndex: number;
	summary: string;
	inputs: string[];
	outputs: string[];
	isInferred: boolean;
	anchorId: string | null;
	colour: number;
	position: Vector3;
};

export type FlowEdgeKind = 'flow' | 'handover' | 'deadEnd' | 'orphan';

export type FlowEdge = {
	id: string;
	kind: FlowEdgeKind;
	artefact: string;
	fromId: string;
	toId: string;
	failureNote: string;
	colour: number;
	from: Vector3;
	to: Vector3;
};

export type FlowLane = { name: string; colour: number; laneHeight: number };

export type FlowModel = { nodes: FlowNode[]; edges: FlowEdge[]; lanes: FlowLane[] };

export type FlowHover = { nodeId?: string; edgeId?: string; x: number; y: number };

export type FlowCallbacks = {
	onHover: (hover: FlowHover | null) => void;
	onSelectNode: (nodeId: string | null) => void;
};
