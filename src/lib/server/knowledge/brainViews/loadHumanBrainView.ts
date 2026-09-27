import { getBrainItems } from '../getBrainItems';
import type { KbBrainItem, KbBrainSummary } from '$lib/data/knowledge/knowledgeTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export type HumanBrainView = {
	kind: 'human';
	brain: KbBrainSummary;
	items: KbBrainItem[];
};

export async function loadHumanBrainView(
	supabase: SupabaseClient,
	brain: KbBrainSummary
): Promise<HumanBrainView> {
	return { kind: 'human', brain, items: await getBrainItems(supabase, brain.id) };
}
