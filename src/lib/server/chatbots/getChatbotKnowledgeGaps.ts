import type { KnowledgeGap, KnowledgeGapStatus } from '$lib/data/chatbotTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ChatbotKnowledgeGaps = { open: KnowledgeGap[]; answered: KnowledgeGap[] };

type GapRow = {
	id: string;
	member_id: string | null;
	question: string;
	missing_knowledge: string;
	status: KnowledgeGapStatus;
	times_asked: number;
	answer: string | null;
	last_asked_at: string;
	resolved_at: string | null;
};

const recentlyAnsweredShown = 8;

export async function getChatbotKnowledgeGaps(
	supabase: SupabaseClient,
	chatbotId: string
): Promise<ChatbotKnowledgeGaps> {
	const emailsByMember = await memberEmailsFor(supabase, chatbotId);
	const gaps = (await gapRowsFor(supabase, chatbotId)).map((row) => toKnowledgeGap(row, emailsByMember));
	return {
		open: gaps.filter((gap) => gap.status === 'open'),
		answered: gaps.filter((gap) => gap.status === 'answered').slice(0, recentlyAnsweredShown)
	};
}

async function gapRowsFor(supabase: SupabaseClient, chatbotId: string): Promise<GapRow[]> {
	const { data, error } = await supabase
		.from('chatbot_knowledge_gaps')
		.select('id, member_id, question, missing_knowledge, status, times_asked, answer, last_asked_at, resolved_at')
		.eq('chatbot_id', chatbotId)
		.neq('status', 'dismissed')
		.order('last_asked_at', { ascending: false });
	if (error !== null) throw error;
	return (data ?? []) as GapRow[];
}

async function memberEmailsFor(
	supabase: SupabaseClient,
	chatbotId: string
): Promise<Map<string, string>> {
	const { data, error } = await supabase
		.from('chatbot_members')
		.select('member_id, invited_email')
		.eq('chatbot_id', chatbotId)
		.not('member_id', 'is', null);
	if (error !== null) throw error;
	return new Map((data ?? []).map((row) => [row.member_id as string, row.invited_email as string]));
}

function toKnowledgeGap(row: GapRow, emailsByMember: Map<string, string>): KnowledgeGap {
	return {
		id: row.id,
		question: row.question,
		missingKnowledge: row.missing_knowledge,
		status: row.status,
		askedByEmail: row.member_id === null ? null : (emailsByMember.get(row.member_id) ?? null),
		timesAsked: row.times_asked,
		lastAskedAt: row.last_asked_at,
		answer: row.answer,
		resolvedAt: row.resolved_at
	};
}
