import { knowledgeReadingCaps } from '$lib/data/knowledge/knowledgeReadingCaps';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ExperienceEntry = {
	brainName: string;
	title: string;
	body: string;
	occurredAt: string | null;
};

const instanceCategory = 'instance';

type ExperienceRow = {
	title: string;
	body: string;
	occurred_at: string | null;
	kb_brains: { name: string } | { name: string }[] | null;
};

// Runs on the service client once the caller has proved they may read the
// knowledge base: the most recent
// entries across every experience brain of the knowledge base.
export async function readExperienceEntries(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<ExperienceEntry[]> {
	const { data, error } = await supabase
		.from('kb_brain_items')
		.select('title, body, occurred_at, created_at, kb_brains!inner(name, knowledge_base_id, category)')
		.eq('kb_brains.knowledge_base_id', knowledgeBaseId)
		.eq('kb_brains.category', instanceCategory)
		.order('occurred_at', { ascending: false, nullsFirst: false })
		.order('created_at', { ascending: false })
		.limit(knowledgeReadingCaps.mostExperienceItems);
	if (error !== null) throw error;
	return ((data ?? []) as unknown as ExperienceRow[]).map((row) => ({
		brainName: brainNameFrom(row.kb_brains),
		title: row.title,
		body: row.body,
		occurredAt: row.occurred_at
	}));
}

function brainNameFrom(brain: ExperienceRow['kb_brains']): string {
	if (brain === null) return '';
	if (Array.isArray(brain)) return brain[0]?.name ?? '';
	return brain.name;
}
