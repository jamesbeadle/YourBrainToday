import { allTasks } from '$lib/data/workflowModel';
import { humanItemKinds } from '$lib/data/knowledge/humanConnections';
import { findKnowledgeKind, type KnowledgeKind } from '$lib/data/knowledge/knowledgeKinds';
import type { KnowledgeBaseReading } from './readKnowledgeBase';

export type BrainDescription = {
	kind: KnowledgeKind;
	label: string;
	question: string;
	explainer: string;
	holds: string;
};

const holdings: Record<KnowledgeKind, (reading: KnowledgeBaseReading) => string> = {
	expertise: (reading) => {
		const pageCount = reading.expertise.reduce((total, brain) => total + brain.pages.length, 0);
		return `${reading.expertise.length} domain model(s), ${pageCount} pages`;
	},
	experience: (reading) => `${reading.experience.length} most recent entries`,
	process: (reading) => {
		const taskCount = reading.processMaps.reduce((total, map) => total + allTasks(map.model).length, 0);
		return `${reading.processMaps.length} process map(s), ${taskCount} tasks`;
	},
	human: (reading) => {
		const people = reading.people.filter((item) => item.itemKind === humanItemKinds.person).length;
		return `${people} people, ${reading.people.length - people} relationships`;
	}
};

export function describeReading(reading: KnowledgeBaseReading): BrainDescription[] {
	return reading.kinds.map((kind) => {
		const definition = findKnowledgeKind(kind);
		return {
			kind,
			label: definition.label,
			question: definition.question,
			explainer: definition.explainer,
			holds: holdings[kind](reading)
		};
	});
}

export function describeReadingAsLines(reading: KnowledgeBaseReading): string {
	return describeReading(reading)
		.map((brain) => `- ${brain.label} (${brain.kind}) — ${brain.question} ${brain.explainer} Holds: ${brain.holds}.`)
		.join('\n');
}
