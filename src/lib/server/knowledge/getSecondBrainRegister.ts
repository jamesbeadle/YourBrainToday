import {
	loadKbBrains,
	loadProcessMaps,
	type KbBrainRow,
	type ProcessRow
} from './registerQueries';
import { brainHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
import type { KnowledgeKind } from '$lib/data/knowledge/knowledgeKinds';
import type { SupabaseClient } from '@supabase/supabase-js';

export type RegisterBrain = {
	id: string;
	kind: KnowledgeKind;
	name: string;
	entityName: string;
	href: string;
	updatedAt: string;
};

export type KnowledgeBaseRegisterGroup = {
	id: string;
	name: string;
	description: string;
	isArchived: boolean;
	brains: RegisterBrain[];
};

export async function getSecondBrainRegister(
	supabase: SupabaseClient
): Promise<KnowledgeBaseRegisterGroup[]> {
	const groups = await loadKnowledgeBases(supabase);
	const brainRows = await loadKbBrains(supabase);
	const processRows = await loadProcessMaps(supabase, brainRows);
	for (const group of groups) {
		group.brains = registerBrainsFor(group.id, brainRows, processRows);
	}
	return groups;
}

async function loadKnowledgeBases(supabase: SupabaseClient): Promise<KnowledgeBaseRegisterGroup[]> {
	const { data, error } = await supabase
		.from('knowledge_bases')
		.select('id, name, description, is_archived')
		.order('updated_at', { ascending: false });
	if (error !== null) throw error;
	return (data ?? []).map((row) => ({
		id: row.id,
		name: row.name,
		description: row.description,
		isArchived: row.is_archived,
		brains: []
	}));
}

function registerBrainsFor(
	knowledgeBaseId: string,
	brainRows: KbBrainRow[],
	processRows: ProcessRow[]
): RegisterBrain[] {
	const kbRows = brainRows.filter((row) => row.knowledge_base_id === knowledgeBaseId);
	const kbEntityIds = new Set(
		kbRows.map((row) => row.domain_brains?.entity_id).filter((id) => typeof id === 'string')
	);
	const fallbackEntityName = kbRows.find((row) => row.domain_brains?.entities)?.domain_brains
		?.entities?.name;
	const stored = kbRows.map((row) => storedRegisterBrain(knowledgeBaseId, row, fallbackEntityName));
	const processes = processRows
		.filter((row) => kbEntityIds.has(row.entity_id))
		.map((row) => processRegisterBrain(knowledgeBaseId, row));
	return [...stored, ...processes];
}

function storedRegisterBrain(
	knowledgeBaseId: string,
	row: KbBrainRow,
	fallbackEntityName: string | undefined
): RegisterBrain {
	return {
		id: row.id,
		kind: row.category === 'domain' ? 'expertise' : 'experience',
		name: row.name,
		entityName: row.domain_brains?.entities?.name ?? fallbackEntityName ?? '',
		href: brainHref(knowledgeBaseId, row.id),
		updatedAt: row.updated_at
	};
}

function processRegisterBrain(knowledgeBaseId: string, row: ProcessRow): RegisterBrain {
	return {
		id: row.id,
		kind: 'process',
		name: row.name,
		entityName: row.entities?.name ?? '',
		href: brainHref(knowledgeBaseId, row.id),
		updatedAt: row.created_at
	};
}
