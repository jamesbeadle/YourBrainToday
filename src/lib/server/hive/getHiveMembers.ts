import type { SupabaseClient } from '@supabase/supabase-js';
import type { HiveMember } from '$lib/data/hiveTypes';

export async function getHiveMembers(supabase: SupabaseClient): Promise<HiveMember[]> {
	const { data, error } = await supabase
		.from('hive_mind_members')
		.select('id, handle, specialty_name, pitch, approved_at, question_count')
		.order('question_count', { ascending: false })
		.order('approved_at');
	if (error !== null) throw error;
	return (data ?? []).map((row) => ({
		id: row.id,
		handle: row.handle,
		specialtyName: row.specialty_name,
		pitch: row.pitch,
		approvedAt: row.approved_at,
		questionCount: row.question_count
	}));
}
