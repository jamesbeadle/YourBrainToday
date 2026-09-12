import type { HiveBrainStatus } from '$lib/data/hiveTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function getHiveBrainStatus(
	supabase: SupabaseClient,
	brainId: string
): Promise<HiveBrainStatus> {
	return {
		application: await latestApplication(supabase, brainId),
		membership: await membership(supabase, brainId)
	};
}

async function latestApplication(supabase: SupabaseClient, brainId: string) {
	const { data, error } = await supabase
		.from('hive_mind_applications')
		.select('id, status, pitch, decision_note, created_at')
		.eq('brain_id', brainId)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return {
		id: data.id,
		status: data.status,
		pitch: data.pitch,
		decisionNote: data.decision_note,
		createdAt: data.created_at
	};
}

async function membership(supabase: SupabaseClient, brainId: string) {
	const { data, error } = await supabase
		.from('hive_mind_members')
		.select('approved_at, question_count, credits_earned')
		.eq('brain_id', brainId)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return {
		approvedAt: data.approved_at,
		questionCount: data.question_count,
		creditsEarned: data.credits_earned
	};
}
