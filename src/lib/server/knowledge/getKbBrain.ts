import type { SupabaseClient } from '@supabase/supabase-js';
import { kbBrainColumns, toKbBrainSummary, type KbBrainRow } from './getKbBrains';
import type { KbBrainSummary } from '$lib/data/knowledge/knowledgeTypes';

export async function getKbBrain(
	supabase: SupabaseClient,
	brainId: string
): Promise<KbBrainSummary | null> {
	const { data, error } = await supabase
		.from('kb_brains')
		.select(kbBrainColumns)
		.eq('id', brainId)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return toKbBrainSummary(data as KbBrainRow);
}
