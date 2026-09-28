import { emailOf, memberEmailsFor } from './chatbotMemberEmails';
import type { ChatbotRuling } from '$lib/data/chatbotRulings';
import type { SupabaseClient } from '@supabase/supabase-js';

type RulingRow = {
	id: string;
	question: string;
	preferred_answer: string;
	asked_by_member_id: string | null;
	created_at: string;
};

const rulingColumns = 'id, question, preferred_answer, asked_by_member_id, created_at';

export async function getChatbotRulings(
	supabase: SupabaseClient,
	chatbotId: string
): Promise<ChatbotRuling[]> {
	const emailsByMember = await memberEmailsFor(supabase, chatbotId);
	const { data, error } = await supabase
		.from('chatbot_rulings')
		.select(rulingColumns)
		.eq('chatbot_id', chatbotId)
		.order('created_at', { ascending: false });
	if (error !== null) throw error;
	return ((data ?? []) as RulingRow[]).map((row) => ({
		id: row.id,
		question: row.question,
		preferredAnswer: row.preferred_answer,
		askedByEmail: emailOf(row.asked_by_member_id, emailsByMember),
		createdAt: row.created_at
	}));
}
