import { deliverChatbotInvite } from './deliverChatbotInvite';
import type { EmailDelivery } from '$lib/data/emailDelivery';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ResendOutcome = 'no_pending_invite' | EmailDelivery;

// Only a member who has not yet joined can be re-invited; RLS keeps the
// lookup to the owner's own members.
export async function resendChatbotInvite(
	supabase: SupabaseClient,
	chatbot: { id: string; name: string },
	memberRowId: string,
	inviterEmail: string,
	origin: string
): Promise<ResendOutcome> {
	const invitedEmail = await pendingInvitedEmail(supabase, chatbot.id, memberRowId);
	if (invitedEmail === null) return 'no_pending_invite';
	return deliverChatbotInvite({ chatbot, invitedEmail, inviterEmail, origin });
}

async function pendingInvitedEmail(
	supabase: SupabaseClient,
	chatbotId: string,
	memberRowId: string
): Promise<string | null> {
	const { data, error } = await supabase
		.from('chatbot_members')
		.select('invited_email')
		.eq('id', memberRowId)
		.eq('chatbot_id', chatbotId)
		.is('member_id', null)
		.maybeSingle();
	if (error !== null) throw error;
	return data?.invited_email ?? null;
}
