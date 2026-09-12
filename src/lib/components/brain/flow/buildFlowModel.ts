import { Vector3 } from 'three';
import { edgeSeedsOf, placedEdge } from './flowEdges';
import { depthsOf } from './flowDepths';
import { laneCentres, placeNodes } from './flowLayout';
import { laneHueAt, SINK_TINT, SOURCE_TINT } from './flowPalette';
import type { WorkflowModel, WorkflowRole, WorkflowTask } from '$lib/data/workflowModel';
import type { FlowLane, FlowModel, FlowNode } from './flowTypes';

export function buildFlowModel(model: WorkflowModel, seedText: string): FlowModel {
	const centres = laneCentres(model.roles.length);
	const lanes: FlowLane[] = model.roles.map((role, index) => ({
		name: role.name,
		colour: laneHueAt(index),
		laneHeight: centres[index]
	}));
	const nodes = [
		...model.externalInputs.map(sourceNode),
		...model.roles.flatMap((role, roleIndex) => stationNodes(role, roleIndex, lanes[roleIndex]))
	];
	const seeds = edgeSeedsOf(model, nodes);
	placeNodes(nodes, depthsOf(nodes, seeds), lanes, seedText);
	settleSources(nodes, seeds);
	const nodesById = new Map(nodes.map((node) => [node.id, node]));
	return { nodes, edges: seeds.map((seed) => placedEdge(seed, nodesById)), lanes };
}

function sourceNode(externalInput: string, index: number): FlowNode {
	return {
		id: `source:${index}`,
		kind: 'source',
		name: externalInput,
		roleName: 'Outside world',
		roleIndex: -1,
		summary: 'Arrives from outside the business and starts work off.',
		inputs: [],
		outputs: [externalInput],
		isInferred: false,
		anchorId: null,
		colour: SOURCE_TINT,
		position: new Vector3()
	};
}

function stationNodes(role: WorkflowRole, roleIndex: number, lane: FlowLane): FlowNode[] {
	return role.tasks.flatMap((task, taskIndex) => {
		const station: FlowNode = {
			id: `station:${roleIndex}:${taskIndex}`,
			kind: 'station',
			name: task.name,
			roleName: role.name,
			roleIndex,
			summary: task.summary,
			inputs: task.inputs,
			outputs: task.outputs,
			isInferred: task.provenance === 'inferred',
			anchorId: null,
			colour: lane.colour,
			position: new Vector3()
		};
		return [station, ...sinkNodes(task, station)];
	});
}

function sinkNodes(task: WorkflowTask, station: FlowNode): FlowNode[] {
	if (task.businessOutput === undefined) return [];
	return [
		{
			id: `sink:${station.id}`,
			kind: 'sink',
			name: task.businessOutput,
			roleName: station.roleName,
			roleIndex: station.roleIndex,
			summary: 'Leaves the business — a customer, supplier, or regulator receives it.',
			inputs: [task.businessOutput],
			outputs: [],
			isInferred: station.isInferred,
			anchorId: station.id,
			colour: SINK_TINT,
			position: new Vector3()
		}
	];
}

function settleSources(nodes: FlowNode[], seeds: { fromId: string; toId: string }[]): void {
	const nodesById = new Map(nodes.map((node) => [node.id, node]));
	for (const source of nodes.filter((node) => node.kind === 'source')) {
		const fed = seeds.filter((seed) => seed.fromId === source.id).map((seed) => nodesById.get(seed.toId));
		const consumers = fed.filter((node): node is FlowNode => node !== undefined);
		if (consumers.length === 0) continue;
		source.position.y = consumers.reduce((sum, node) => sum + node.position.y, 0) / consumers.length;
	}
}
