import type { SupabaseClient } from '@supabase/supabase-js';

export type HiveApplicationOutcome = 'submitted' | 'already_pending';

export async function applyToHiveMind(
	supabase: SupabaseClient,
	brainId: string,
	pitch: string
): Promise<HiveApplicationOutcome> {
	const { error } = await supabase
		.from('hive_mind_applications')
		.insert({ brain_id: brainId, pitch });
	if (error === null) return 'submitted';
	if (error.message.includes('one_pending_application_per_brain')) return 'already_pending';
	throw error;
}
