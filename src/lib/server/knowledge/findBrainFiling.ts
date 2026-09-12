import type { SupabaseClient } from '@supabase/supabase-js';

export type BrainFiling = { brainId: string; knowledgeBaseId: string; knowledgeBaseName: string };

export async function findBrainFiling(
	supabase: SupabaseClient,
	domainBrainId: string
): Promise<BrainFiling | null> {
	const { data, error } = await supabase
		.from('kb_brains')
		.select('id, knowledge_base_id, knowledge_bases(name)')
		.eq('domain_brain_id', domainBrainId)
		.limit(1);
	if (error !== null) throw error;
	const row = ((data ?? []) as unknown as FilingRow[])[0];
	if (row === undefined) return null;
	return {
		brainId: row.id,
		knowledgeBaseId: row.knowledge_base_id,
		knowledgeBaseName: nameFrom(row.knowledge_bases)
	};
}

type FilingRow = {
	id: string;
	knowledge_base_id: string;
	knowledge_bases: { name: string } | { name: string }[] | null;
};

function nameFrom(knowledgeBase: FilingRow['knowledge_bases']): string {
	if (knowledgeBase === null) return '';
	if (Array.isArray(knowledgeBase)) return knowledgeBase[0]?.name ?? '';
	return knowledgeBase.name;
}
