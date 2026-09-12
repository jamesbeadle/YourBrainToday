import type { LegalSection } from '$lib/data/legalDocument';

export const privacyRightsSections: LegalSection[] = [
	{
		heading: 'How long we keep it',
		paragraphs: [
			'We keep your information while your account is active. When your account is deleted, your knowledge bases, chatbots and their conversations, tokens and authorisations are deleted with it. Chatbot conversations are also deleted when the manager deletes the chatbot. Enquiries and client register records are kept while we are working with, or hoping to work with, the business concerned, and reviewed at least every two years. Records of purchases are kept for six years, as tax and accounting law requires, and no longer. Server logs are kept for no more than 30 days.'
		]
	},
	{
		heading: 'Your rights',
		paragraphs: [
			'Under UK data protection law you can ask us for a copy of your information, ask us to correct it, delete it, or restrict how we use it, object to our use of it, and receive it in a portable form — the expertise brain export exists precisely for that. Contact us and we will respond within a month.',
			'If you are unhappy with how we handle your information you can complain to the Information Commissioner’s Office at ico.org.uk, although we would rather you told us first so that we can put it right.'
		]
	},
	{
		heading: 'Cookies',
		paragraphs: [
			'We use only the session cookies needed to keep you signed in and the service working. They are strictly necessary, so no banner asks for your consent, and there are no advertising or third-party tracking cookies.'
		]
	},
	{
		heading: 'Changes to this statement',
		paragraphs: [
			'If how we handle your information changes, this statement will change with it, and the date at the top will tell you when. Material changes will be flagged on the site or by email.'
		]
	}
];
