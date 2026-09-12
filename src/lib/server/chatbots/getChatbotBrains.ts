import { getBrainContexts } from '../brain/getBrainContexts';
import { getBrainPageIndex } from '../brain/getBrainPageIndex';
import type { BrainContext, BrainPageSummary } from '$lib/data/brainTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ChatbotBrainModel = {
	brainId: string;
	handle: string;
	name: string;
	description: string;
	contexts: BrainContext[];
	pages: BrainPageSummary[];
};

const handleHexLength = 4;

// Runs on the service client: members have no RLS path to brain content, so
// the caller must have proved membership (the spend RPC) before asking.
export async function getChatbotBrains(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<ChatbotBrainModel[]> {
	const { data, error } = await supabase
		.from('kb_brains')
		.select('name, description, domain_brain_id')
		.eq('knowledge_base_id', knowledgeBaseId)
		.eq('category', 'domain')
		.not('domain_brain_id', 'is', null)
		.order('created_at');
	if (error !== null) throw error;
	const models: ChatbotBrainModel[] = [];
	for (const row of data ?? []) {
		const brainId = row.domain_brain_id as string;
		models.push({
			brainId,
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
