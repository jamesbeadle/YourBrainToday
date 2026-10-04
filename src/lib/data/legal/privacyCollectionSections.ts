import { companyDetails } from '$lib/data/companyDetails';
import type { LegalSection } from '$lib/data/legalDocument';

export const privacyCollectionSections: LegalSection[] = [
	{
		heading: 'Who we are',
		paragraphs: [
			`${companyDetails.legalName}, a company registered in England and Wales under number ${companyDetails.registrationNumber} with its registered office at ${companyDetails.registeredAddress}, is the data controller for the personal information handled by Your Brain Today. For anything in this statement, contact ${companyDetails.consultingEmail}.`,
			'The short version of our promise, stated once here and repeated wherever it matters: your knowledge powers your tools and nothing else. It is never sold, never pooled, never used to train anything for anyone else, and it leaves when you do.'
		]
	},
	{
		heading: 'What we collect',
		paragraphs: ['We hold these kinds of information:'],
		listItems: [
			'Account details — your email address, display name, which sign-in method you use (Google, or email and password), and the model you choose for answers.',
			'Knowledge base content — the documents you upload, the answers you give the interviewer, and the expertise, experience, process and human brains built from them. The human brain holds the names, roles and organisations of people you mention, and what you tell us about how they relate to one another.',
			'Chatbot records — each member’s email address and member id, the questions they ask, the answers given, the pages each answer drew on, which questions went unanswered, and how much of the pool each member has spent.',
			'Credit and purchase records — the packs you buy, the credits you spend, send and receive, and credits we grant. Card details go directly to Stripe; we never see or store them.',
			'Access records — shares you create, API tokens you mint, OAuth authorisations you grant, and the log of what happened in each knowledge base, including questions asked of it through the API or MCP server.',
			'Technical records — server logs with your IP address and browser details, kept briefly for security.'
		]
	},
	{
		heading: 'Why we use it, and the lawful basis',
		paragraphs: [
			'We use your information to run the service you asked for: signing you in, interviewing you and reading your documents, answering questions from your own records, running the chatbots you set up, keeping the question log, fulfilling credit purchases, delivering shares and connected-tool access, and sending service emails such as chatbot invitations and password resets. The lawful basis for this is performing our contract with you.',
			'We rely on our legitimate interests to keep the service secure, to improve it, to reply when you write to us, and to keep the question log as evidence of what a chatbot was asked and what it answered. We rely on legal obligation to keep purchase records for tax and accounting law. Where we ask for consent — for anything beyond the above — we will say so at the time and you can withdraw it.',
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
