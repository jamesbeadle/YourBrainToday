import { findKnowledgeKind, kindForCategory, type KnowledgeKindDefinition } from './knowledgeKinds';
import type { KbBrainSummary } from './knowledgeTypes';
import type { ProcessMapSummary } from '$lib/server/knowledge/getProcessMaps';

export type OpenBrain = { id: string; name: string; kind: KnowledgeKindDefinition };

/** A brain route id names either a stored brain or a process map; whichever holds it is the open brain. */
export function findOpenBrain(
	brainId: string,
	brains: KbBrainSummary[],
	processMaps: ProcessMapSummary[]
): OpenBrain | null {
	const brain = brains.find((candidate) => candidate.id === brainId);
	if (brain !== undefined) {
		return { id: brain.id, name: brain.name, kind: kindForCategory(brain.category) };
	}
	const processMap = processMaps.find((candidate) => candidate.id === brainId);
	if (processMap === undefined) return null;
	return { id: processMap.id, name: processMap.name, kind: findKnowledgeKind('process') };
}
