import {
	findKnowledgeKind,
	kindForCategory,
	knowledgeKinds,
	type KnowledgeKind
} from '$lib/data/knowledge/knowledgeKinds';
import { brainHref, newBrainHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
import type { KbBrainSummary } from '$lib/data/knowledge/knowledgeTypes';
import type { ProcessMapSummary } from '$lib/server/knowledge/getProcessMaps';

export type ConstellationSlot = {
	id: string;
	variant: 'brain' | 'ghost';
	name: string;
	href: string;
	accent: string;
	kind: KnowledgeKind;
	kindLabel: string;
	category: 'domain' | 'instance' | null;
};

export function buildConstellationSlots(
	knowledgeBaseId: string,
	brains: KbBrainSummary[],
	processMaps: ProcessMapSummary[]
): ConstellationSlot[] {
	const brainSlots = brains.map((brain) => brainSlot(knowledgeBaseId, brain));
	const processSlots = processMaps.map((processMap) => processSlot(knowledgeBaseId, processMap));
	const filled = [...brainSlots, ...processSlots];
	return [...filled, ...ghostSlots(knowledgeBaseId, filled)];
}

/** The galaxy is built from the slots' ids and names; anything else changing leaves it standing. */
export function areSameSlotsToShow(shown: ConstellationSlot[], next: ConstellationSlot[]): boolean {
	if (shown.length !== next.length) return false;
	return shown.every((slot, index) => slot.id === next[index].id && slot.name === next[index].name);
}

function brainSlot(knowledgeBaseId: string, brain: KbBrainSummary): ConstellationSlot {
	const kind = kindForCategory(brain.category);
	return {
		id: brain.id,
		variant: 'brain',
		name: brain.name,
		href: brainHref(knowledgeBaseId, brain.id),
		accent: kind.accent,
		kind: kind.kind,
		kindLabel: kind.label,
		category: brain.category
	};
}

function processSlot(knowledgeBaseId: string, processMap: ProcessMapSummary): ConstellationSlot {
	return {
		id: processMap.id,
		variant: 'brain',
		name: processMap.name,
		href: brainHref(knowledgeBaseId, processMap.id),
		accent: findKnowledgeKind('process').accent,
		kind: 'process',
		kindLabel: 'Process',
		category: null
	};
}

function ghostSlots(knowledgeBaseId: string, filled: ConstellationSlot[]): ConstellationSlot[] {
	const presentLabels = new Set(filled.map((slot) => slot.kindLabel));
	return knowledgeKinds
		.filter((kind) => !presentLabels.has(kind.label))
		.map((kind) => ({
			id: `ghost-${kind.kind}`,
			variant: 'ghost' as const,
			name: `Add ${kind.label} Brain`,
			href: newBrainHref(knowledgeBaseId, kind.kind),
			accent: kind.accent,
			kind: kind.kind,
			kindLabel: kind.label,
			category: null
		}));
}
