import type { LegalSection } from '$lib/data/legalDocument';

export const privacyRightsSections: LegalSection[] = [
	{
		heading: 'How long we keep it',
		paragraphs: [
			'We keep your information while your account is active. When your account is deleted, your knowledge bases, chatbots and their question logs, tokens and authorisations are deleted with it. A chatbot’s question log is kept for as long as the chatbot exists: removing a member does not remove their entries, because the log is the manager’s record of what was asked, and the whole log goes when the manager deletes the chatbot. Records of purchases are kept for six years, as tax and accounting law requires, and no longer. Server logs are kept for no more than 30 days.'
		]
	},
	{
		heading: 'Your rights',
		paragraphs: [
			'Under UK data protection law you can ask us for a copy of your information, ask us to correct it, delete it, or restrict how we use it, object to our use of it, and receive it in a portable form — the expertise brain export exists precisely for that. Contact us and we will respond within a month. A chatbot member asking about their entries in a question log is answered by us, not by the manager, and where the manager’s legitimate interest in keeping the record outweighs a request to erase it we will say so and why.',
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
