import type { SupabaseClient } from '@supabase/supabase-js';

export type HiveQuestionRecord = {
	id: string;
	question: string;
	answerMarkdown: string;
	createdAt: string;
};

const recentQuestionLimit = 5;

export async function getRecentHiveQuestions(
	supabase: SupabaseClient
): Promise<HiveQuestionRecord[]> {
	const { data, error } = await supabase
		.from('hive_mind_questions')
		.select('id, question, answer_markdown, created_at')
		.order('created_at', { ascending: false })
		.limit(recentQuestionLimit);
	if (error !== null) throw error;
	return (data ?? []).map((row) => ({
		id: row.id,
		question: row.question,
		answerMarkdown: row.answer_markdown,
		createdAt: row.created_at
	}));
}
