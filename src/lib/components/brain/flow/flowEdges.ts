import { Vector3 } from 'three';
import { SINK_TINT } from './flowPalette';
import { placedStub, stubSeed } from './flowStubs';
import type { WorkflowModel } from '$lib/data/workflowModel';
import type { FlowEdge, FlowNode } from './flowTypes';

export type EdgeSeed = Omit<FlowEdge, 'from' | 'to'>;

export function edgeSeedsOf(model: WorkflowModel, nodes: FlowNode[]): EdgeSeed[] {
	const stations = nodes.filter((node) => node.kind === 'station');
	const producers = producersByArtefact(nodes);
	const seeds: EdgeSeed[] = [];
	for (const station of stations) {
		const unfed: string[] = [];
		for (const input of station.inputs) {
			const feeders = (producers.get(input.toLowerCase()) ?? []).filter((node) => node.id !== station.id);
			if (feeders.length === 0) unfed.push(input);
			for (const feeder of feeders) seeds.push(feedSeed(model, feeder, station, input));
		}
		if (unfed.length > 0) seeds.push(stubSeed(station, unfed.join(', '), 'orphan'));
		const unconsumed = station.outputs.filter((output) => !isConsumed(output, stations, station));
		if (unconsumed.length > 0 && !hasSink(nodes, station)) {
			seeds.push(stubSeed(station, unconsumed.join(', '), 'deadEnd'));
		}
	}
	for (const sink of nodes.filter((node) => node.kind === 'sink')) {
		const station = nodes.find((node) => node.id === sink.anchorId);
		if (station === undefined) continue;
		seeds.push({
			id: `${station.id}>${sink.id}`,
			kind: 'flow',
			artefact: sink.name,
			fromId: station.id,
			toId: sink.id,
			failureNote: '',
			colour: SINK_TINT
		});
	}
	return seeds;
}

export function placedEdge(seed: EdgeSeed, nodesById: Map<string, FlowNode>): FlowEdge {
	const from = nodesById.get(seed.fromId)?.position;
	const to = nodesById.get(seed.toId)?.position;
	if (seed.kind === 'orphan' || seed.kind === 'deadEnd') return placedStub(seed, from ?? to);
	return { ...seed, from: from ?? new Vector3(), to: to ?? new Vector3() };
}

function producersByArtefact(nodes: FlowNode[]): Map<string, FlowNode[]> {
	const producers = new Map<string, FlowNode[]>();
	for (const node of nodes) {
		if (node.kind === 'sink') continue;
		for (const output of node.outputs) {
			const key = output.toLowerCase();
			producers.set(key, [...(producers.get(key) ?? []), node]);
		}
	}
	return producers;
}

function feedSeed(model: WorkflowModel, feeder: FlowNode, station: FlowNode, artefact: string): EdgeSeed {
	const isHandover = feeder.kind === 'station' && feeder.roleIndex !== station.roleIndex;
	return {
		id: `${feeder.id}>${station.id}:${artefact.toLowerCase()}`,
		kind: isHandover ? 'handover' : 'flow',
		artefact,
		fromId: feeder.id,
		toId: station.id,
		failureNote: isHandover ? failureNoteFor(model, feeder, station.roleName) : '',
		colour: feeder.colour
	};
}

function failureNoteFor(model: WorkflowModel, feeder: FlowNode, toRole: string): string {
	const task = model.roles[feeder.roleIndex]?.tasks.find((candidate) => candidate.name === feeder.name);
	const handover = task?.handovers.find((candidate) => candidate.toRole === toRole);
	return handover?.failureNote ?? '';
}

function isConsumed(output: string, stations: FlowNode[], producer: FlowNode): boolean {
	const wanted = output.toLowerCase();
	return stations.some(
		(station) => station !== producer && station.inputs.some((input) => input.toLowerCase() === wanted)
	);
}

function hasSink(nodes: FlowNode[], station: FlowNode): boolean {
	return nodes.some((node) => node.kind === 'sink' && node.anchorId === station.id);
}
