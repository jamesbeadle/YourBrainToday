import { mostRulingsInPrompt } from '$lib/data/chatbotRulings';
import type { SupabaseClient } from '@supabase/supabase-js';

export type PromptRuling = { question: string; preferredAnswer: string };

// Runs on the service client once membership is proven: the rulings the bot
// is shown at this question, newest first.
export async function readChatbotRulings(
	supabase: SupabaseClient,
	chatbotId: string
): Promise<PromptRuling[]> {
	const { data, error } = await supabase
		.from('chatbot_rulings')
		.select('question, preferred_answer')
		.eq('chatbot_id', chatbotId)
		.order('created_at', { ascending: false })
		.limit(mostRulingsInPrompt);
	if (error !== null) throw error;
	return (data ?? []).map((row) => ({ question: row.question, preferredAnswer: row.preferred_answer }));
}
