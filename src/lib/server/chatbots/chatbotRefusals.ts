import { chatbotQuietMessages } from '$lib/data/chatbotQuietMessages';
import { getChatbotOwnerName } from './getChatbotOwnerName';
import type { ChatbotSpend } from './spendForChatbotQuestion';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ChatbotRefusal = { status: number; message: string };

export const notAMemberRefusal: ChatbotRefusal = {
	status: 403,
	message: "You're not a member of this bot"
};

const paymentRequiredStatus = 402;

// The member is told which of the three quiet states they hit; an exhausted
// allowance names the owner so they know who to ask.
export async function chatbotRefusalFor(
	service: SupabaseClient,
	chatbot: { ownerId: string },
	spend: Exclude<ChatbotSpend, object>
): Promise<ChatbotRefusal> {
	if (spend === 'not_a_member') return notAMemberRefusal;
	if (spend === 'chatbot_paused') return quiet(chatbotQuietMessages.paused);
	if (spend === 'chatbot_out_of_credits') return quiet(chatbotQuietMessages.poolEmpty);
	const ownerName = await getChatbotOwnerName(service, chatbot.ownerId);
	return quiet(chatbotQuietMessages.allowanceUsedUp(ownerName));
}

function quiet(message: string): ChatbotRefusal {
	return { status: paymentRequiredStatus, message };
}
