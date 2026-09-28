import type { SupabaseClient } from '@supabase/supabase-js';

export async function memberEmailsFor(
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

export function emailOf(memberId: string | null, emailsByMember: Map<string, string>): string | null {
	if (memberId === null) return null;
	return emailsByMember.get(memberId) ?? null;
}
