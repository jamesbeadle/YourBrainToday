import { companyDetails } from '$lib/data/companyDetails';
import type { LegalSection } from '$lib/data/legalDocument';

export const privacySharingSections: LegalSection[] = [
	{
		heading: 'Who processes it for us',
		paragraphs: ['A small number of providers process data on our behalf, as our sub-processors:'],
		listItems: [
			'Supabase — the database, authentication, and the storage where uploaded documents live.',
			'Anthropic — AI processing of the content sent to generate replies and answers.',
			'Stripe — payment processing for credit packs. Stripe receives your email address and the card details you type on its checkout page, and is the controller of the card data it holds.',
			'Resend — sending the service’s emails, such as chatbot invitations and password resets. Resend receives the recipient’s email address and the content of the email.',
			'Vercel — hosting of the application, which places its servers’ logs within reach of Vercel.'
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
			'Only the people you choose. Sharing a knowledge base gives the named person read-only access to it. A chatbot manager sees the questions and answers of the members they invited, in the chatbot’s question log. Our staff can see account, credit and purchase records in order to run the service, and the content of a knowledge base only when you ask us to look at it. Beyond that, we disclose information only where the law requires it.'
		]
	},
	{
		heading: 'If you are a chatbot member',
		paragraphs: [
			'You may be reading this because someone else brought you here: a manager invited you to a chatbot. This section is for you.',
			'We hold the email address the manager gave us, a member id, your display name if you set one, and every question you ask and answer you receive, with the pages the answer drew on. Your questions are sent to Anthropic to be answered, as described above.',
			'Your questions and the answers are kept in the chatbot’s question log, stored against your member id. The manager who funds the chatbot can read and download that log, including the questions the chatbot could not answer, so that they can fill the gaps and show what was asked if a dispute arises. The log cannot be edited or trimmed inside the service, by you or by the manager. The manager is responsible for telling you this before inviting you; if they have not, ask them.',
			`You have the same rights as any account holder, set out below. If you would rather not be a member, tell the manager and they can remove you — or write to ${companyDetails.consultingEmail} and we will.`
		]
	}
];
