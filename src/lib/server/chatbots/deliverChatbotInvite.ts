import { sendTransactionalEmail, type EmailDelivery } from '../email/sendTransactionalEmail';
import { chatbotInviteEmailSubject, renderChatbotInviteEmail } from '../email/chatbotInviteEmail';

export type ChatbotInvite = {
	chatbot: { id: string; name: string };
	invitedEmail: string;
	inviterEmail: string;
	origin: string;
};

export async function deliverChatbotInvite(invite: ChatbotInvite): Promise<EmailDelivery> {
	const { chatbot, invitedEmail, inviterEmail, origin } = invite;
	return sendTransactionalEmail({
		to: invitedEmail,
		subject: chatbotInviteEmailSubject(inviterEmail, chatbot.name),
		html: renderChatbotInviteEmail(inviterEmail, chatbot.name, `${origin}/chatbots/${chatbot.id}`)
	});
}
