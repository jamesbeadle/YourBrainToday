export type EmailDelivery = 'sent' | 'skipped' | 'failed';

const undeliveredInviteNotices: Record<Exclude<EmailDelivery, 'sent'>, string> = {
	skipped: 'Invite recorded but the email was not sent — email is not configured.',
	failed: 'Invite recorded but the email could not be sent — ask them to sign in, or try again later.'
};

export function undeliveredInviteNotice(delivery: EmailDelivery): string | null {
	if (delivery === 'sent') return null;
	return undeliveredInviteNotices[delivery];
}
