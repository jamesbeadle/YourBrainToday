import { companyDetails } from '$lib/data/companyDetails';
import type { LegalSection } from '$lib/data/legalDocument';

export const privacySharingSections: LegalSection[] = [
	{
		heading: 'Who processes it for us',
		paragraphs: ['A small number of providers process data on our behalf:'],
		listItems: [
			'Supabase — the database, authentication, and the storage where uploaded documents live.',
			'Stripe — payment processing for credit packs.',
			'Anthropic — AI processing of the content sent to generate replies and answers.',
			'Vercel — hosting of the application.',
			'Resend — sending the service’s emails, such as invitations and enquiry notifications.'
		]
	},
	{
		heading: 'International transfers',
		paragraphs: [
			'Some of these providers process data outside the United Kingdom, principally in the United States. Where they do, the transfer is covered by the UK’s adequacy regulations or by the International Data Transfer Agreement or Addendum approved by the Information Commissioner, and by the provider’s own commitments to the same standard of protection.'
		]
	},
	{
		heading: 'Who else can see it',
		paragraphs: [
			'Only the people you choose. Sharing a knowledge base gives the named person read-only access to it. A chatbot manager sees the questions and answers of the members they invited. Our staff see the client register, the requests raised in the client portal, and — for the businesses we consult for — the knowledge base we build together. Beyond that, we disclose information only where the law requires it.'
		]
	},
	{
		heading: 'If you are a chatbot member or a client contact',
		paragraphs: [
			'You may be reading this because someone else brought you here: a manager invited you to a chatbot, or your business named you as a contact in the client portal. This section is for you.',
			'If you were invited to a chatbot, we hold the email address the manager gave us, your display name if you set one, and every question you ask and answer you receive. The manager who funds the chatbot can see those questions and answers, including the ones the chatbot could not answer. Your questions are sent to Anthropic to be answered, as described above. The manager is responsible for telling you this before inviting you; if they have not, ask them.',
			'If you were named as a client contact, we hold your name, email address, phone number and role as your business gave them to us, and the requests and messages you send through the portal. Our staff and the other contacts at your business can see them.',
			`In both cases you have the same rights as any account holder, set out below. If you would rather not be a member or a contact, tell the manager or your business and they can remove you — or write to ${companyDetails.consultingEmail} and we will.`
		]
	}
];
