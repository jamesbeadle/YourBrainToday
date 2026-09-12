import { error } from '@sveltejs/kit';
import { countRecentMemberQuestions } from './recentMemberQuestionCount';
import { slowDownMessage } from '$lib/server/credits/requireSpendHeadroom';
import type { SupabaseClient } from '@supabase/supabase-js';

export const mostMemberQuestionsPerMinute = 15;

export async function requireMemberQuestionHeadroom(
	supabase: SupabaseClient,
	memberId: string
): Promise<void> {
	const recentQuestions = await countRecentMemberQuestions(supabase, memberId);
	if (recentQuestions >= mostMemberQuestionsPerMinute) error(429, slowDownMessage);
}
