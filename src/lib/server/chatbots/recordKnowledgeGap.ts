import type { SupabaseClient } from '@supabase/supabase-js';

type OpenGap = { id: string; question: string; times_asked: number };

const openGapsConsidered = 200;

// Runs on the service client once the answer is recorded — a member has no
// write path to gaps. The same question asked again while it is still open
// counts up rather than piling up.
export async function recordKnowledgeGap(
	supabase: SupabaseClient,
	chatbotId: string,
	memberId: string,
	question: string,
	missingKnowledge: string | null
): Promise<void> {
	if (missingKnowledge === null) return;
	const alreadyOpen = await findOpenGapAsking(supabase, chatbotId, question);
	if (alreadyOpen !== null) return countAnotherAsk(supabase, alreadyOpen);
	const { error } = await supabase.from('chatbot_knowledge_gaps').insert({
		chatbot_id: chatbotId,
		member_id: memberId,
		question,
		missing_knowledge: missingKnowledge
	});
	if (error !== null) throw error;
}

async function findOpenGapAsking(
	supabase: SupabaseClient,
	chatbotId: string,
	question: string
): Promise<OpenGap | null> {
	const { data, error } = await supabase
		.from('chatbot_knowledge_gaps')
		.select('id, question, times_asked')
		.eq('chatbot_id', chatbotId)
		.eq('status', 'open')
		.limit(openGapsConsidered);
	if (error !== null) throw error;
	const wording = comparableWording(question);
	return (data ?? []).find((gap) => comparableWording(gap.question) === wording) ?? null;
}

async function countAnotherAsk(supabase: SupabaseClient, gap: OpenGap): Promise<void> {
	const { error } = await supabase
		.from('chatbot_knowledge_gaps')
		.update({ times_asked: gap.times_asked + 1, last_asked_at: new Date().toISOString() })
		.eq('id', gap.id);
	if (error !== null) throw error;
}

function comparableWording(question: string): string {
	return question.toLowerCase().replace(/\s+/g, ' ').replace(/[?.!\s]+$/, '').trim();
}
