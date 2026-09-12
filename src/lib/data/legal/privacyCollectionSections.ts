import { companyDetails } from '$lib/data/companyDetails';
import type { LegalSection } from '$lib/data/legalDocument';

export const privacyCollectionSections: LegalSection[] = [
	{
		heading: 'Who we are',
		paragraphs: [
			`${companyDetails.legalName}, a company registered in England and Wales under number ${companyDetails.registrationNumber} with its registered office at ${companyDetails.registeredAddress}, is the data controller for the personal information handled by yourbrain.today and by our consultancy. For anything in this statement, contact ${companyDetails.consultingEmail}.`,
			'The short version of our promise, stated once here and repeated wherever it matters: your knowledge powers your tools and nothing else. It is never sold, never pooled, never used to train anything for anyone else, and it leaves when you do.'
		]
	},
	{
		heading: 'What we collect',
		paragraphs: ['We hold these kinds of information:'],
		listItems: [
			'Account details — your email address, display name, and which sign-in method you use (Google, or email and password).',
			'Knowledge base content — the documents you upload, the answers you give the interviewer, and the expertise, experience and process brains built from them.',
			'Chatbot conversations — the questions members ask, the answers given, which questions went unanswered, and how much of the pool each member has spent.',
			'Client register records — for the businesses we work for: the company, the people named as contacts, the requests they raise, and the threads and builds that follow.',
			'Enquiries — the name, email address, company, website and message you send through the contact page, which create a lead in the client register.',
			'Activity records — credit purchases and spends, shares you create, API tokens and OAuth authorisations you grant, notifications, and the log of what happened in each knowledge base. Card details go directly to Stripe; we never see or store them.',
			'Technical records — server logs with your IP address and browser details, kept briefly for security.'
		]
	},
	{
		heading: 'Why we use it, and the lawful basis',
		paragraphs: [
			'We use your information to run the service you asked for: signing you in, interviewing you and reading your documents, answering questions from your own records, running the chatbots you set up, fulfilling credit purchases, delivering shares and connected-tool access, running the client portal, and sending service emails such as invitations. The lawful basis for this is performing our contract with you.',
			'We rely on our legitimate interests to keep the service secure, to improve it, to reply to enquiries and keep the client register, and to send the emails a business relationship needs. We rely on legal obligation to keep purchase records for tax and accounting law. Where we ask for consent — for anything beyond the above — we will say so at the time and you can withdraw it.',
			'We do not use your information for advertising, we do not profile you, and we do not sell it to anyone.'
		]
	},
	{
		heading: 'AI processing',
		paragraphs: [
			'When the service generates something for you — an interview reply, a reading of a document, an answer from a brain, a chatbot answer — the content needed to do it is sent to Anthropic’s Claude API. That is your message or question and the relevant parts of the knowledge base, and for a chatbot it is the member’s question together with the relevant parts of the manager’s knowledge base. Anthropic processes it to produce the answer; it is not used to train models for anyone else.'
		]
	}
];
