import { deliverChatbotInvite, type ChatbotInvite } from './deliverChatbotInvite';
import type { EmailDelivery } from '$lib/data/emailDelivery';
import type { SupabaseClient } from '@supabase/supabase-js';

export type InviteOutcome = 'already_invited' | EmailDelivery;

const duplicateRowCode = '23505';

// The membership row exists once the insert succeeds; an undelivered email
// must not undo it, so the delivery status travels back for the owner to
// see, and the owner can resend.
export async function inviteChatbotMember(
	supabase: SupabaseClient,
	invite: ChatbotInvite,
	allowanceCredits: number
): Promise<InviteOutcome> {
	const { error } = await supabase.from('chatbot_members').insert({
		chatbot_id: invite.chatbot.id,
		invited_email: invite.invitedEmail.toLowerCase(),
		allowance_credits: allowanceCredits
	});
	if (error !== null && error.code === duplicateRowCode) return 'already_invited';
	if (error !== null) throw error;
	return deliverChatbotInvite(invite);
}
