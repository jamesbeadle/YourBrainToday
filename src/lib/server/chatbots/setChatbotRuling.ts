import { readTheSame } from '$lib/data/comparableWording';
import type { SupabaseClient } from '@supabase/supabase-js';

export type RulingToSet = {
	question: string;
	preferredAnswer: string;
	askedByMemberId: string | null;
};

// One preferred answer per question: setting it again for a question that
// reads the same replaces the answer rather than adding a second ruling.
export async function setChatbotRuling(
	supabase: SupabaseClient,
	chatbotId: string,
	ruling: RulingToSet
): Promise<void> {
	const existingId = await findRulingAsking(supabase, chatbotId, ruling.question);
	if (existingId !== null) return replaceRuling(supabase, existingId, ruling);
	const { error } = await supabase.from('chatbot_rulings').insert({
		chatbot_id: chatbotId,
		question: ruling.question,
		preferred_answer: ruling.preferredAnswer,
		asked_by_member_id: ruling.askedByMemberId
	});
	if (error !== null) throw error;
}

async function findRulingAsking(
	supabase: SupabaseClient,
	chatbotId: string,
	question: string
): Promise<string | null> {
	const { data, error } = await supabase
		.from('chatbot_rulings')
		.select('id, question')
		.eq('chatbot_id', chatbotId);
	if (error !== null) throw error;
	return (data ?? []).find((row) => readTheSame(row.question, question))?.id ?? null;
}

async function replaceRuling(
	supabase: SupabaseClient,
	rulingId: string,
	ruling: RulingToSet
): Promise<void> {
	const { error } = await supabase
		.from('chatbot_rulings')
		.update({
			question: ruling.question,
			preferred_answer: ruling.preferredAnswer,
			updated_at: new Date().toISOString()
		})
		.eq('id', rulingId);
	if (error !== null) throw error;
}
