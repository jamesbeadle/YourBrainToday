import { getBrainContexts } from '../../brain/getBrainContexts';
import { getBrainPageIndex } from '../../brain/getBrainPageIndex';
import type { BrainContext, BrainPageSummary } from '$lib/data/brainTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ExpertiseBrainModel = {
	brainId: string;
	kbBrainId: string;
	handle: string;
	name: string;
	description: string;
	contexts: BrainContext[];
	pages: BrainPageSummary[];
};

const handleHexLength = 4;

// Runs on the service client: a chatbot member or an API caller has no RLS
// path to brain content, so the caller must have proved they may read the
// knowledge base before asking.
export async function readExpertiseBrains(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<ExpertiseBrainModel[]> {
	const { data, error } = await supabase
		.from('kb_brains')
		.select('id, name, description, domain_brain_id')
		.eq('knowledge_base_id', knowledgeBaseId)
		.eq('category', 'domain')
		.not('domain_brain_id', 'is', null)
		.order('created_at');
	if (error !== null) throw error;
	const models: ExpertiseBrainModel[] = [];
	for (const row of data ?? []) {
		const brainId = row.domain_brain_id as string;
		models.push({
			brainId,
			kbBrainId: row.id as string,
			handle: handleFor(row.name, brainId),
			name: row.name,
			description: row.description,
			contexts: await getBrainContexts(supabase, brainId),
			pages: await getBrainPageIndex(supabase, brainId)
		});
	}
	return models;
}

function handleFor(name: string, brainId: string): string {
	const slug = name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return `${slug || 'brain'}-${brainId.replace(/-/g, '').slice(0, handleHexLength)}`;
}
