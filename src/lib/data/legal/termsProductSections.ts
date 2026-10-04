import type { LegalSection } from '$lib/data/legalDocument';

export const termsProductSections: LegalSection[] = [
	{
		heading: 'Knowledge bases and the four brains',
		paragraphs: [
			'A knowledge base holds what a business knows in four kinds of brain: an expertise brain for the rules and language of the trade, an experience brain for the record of jobs, events and decisions, a process brain for how the work moves, and a human brain for the people around the business and how they relate to one another. You build them by answering the interviewer or by uploading documents, and the service reads what you give it and files it in the right brain.',
			'Everything you put into a knowledge base — the documents you upload, the answers you give, and the brains built from them — remains yours. You grant us the licence we need to host, process, and display that content in order to run the service for you, and for nothing else. Your content is never sold, never pooled with other customers’ content, and never used to train models for anyone else. You can export an expertise brain as Markdown at any time, free of charge.',
			'You are responsible for having the right to upload what you upload, including any personal data it contains about other people, and for telling those people where the law requires it.'
		]
	},
	{
		heading: 'Chatbots',
		paragraphs: [
			'A chatbot lets people you choose ask a knowledge base without opening it. When you set one up you are its manager: you fund it from your own credits, invite members by their email address, and decide how much each member may spend. Members sign in with the invited address and are bound by these terms when they do.',
			'To generate an answer, the member’s question and the relevant parts of the knowledge base are sent to Anthropic. As manager you must tell your members this, and tell them that their questions are kept on record, before you invite them, and you must not use a chatbot to monitor people in ways the law does not allow.',
			'You can remove a member, stop funding a chatbot, or delete it at any time. Deleting a chatbot deletes its conversations and its question log.'
		]
	},
	{
		heading: 'The question log',
		paragraphs: [
			'Every question put to a chatbot, and the answer it gave, is kept in a log against that chatbot: who asked, when, the exact question, the exact answer, and the pages it drew on. Questions the knowledge base could not answer are logged too, so the manager can see the gap and fill it. The log exists so that the manager can show what was and was not asked if a dispute arises about what the chatbot said.',
			'The log is a record, not a working document: neither a member nor the manager can edit it or remove entries from it inside the service. The manager can read it and download it. It is kept for as long as the chatbot exists and goes when the chatbot is deleted.',
			'Questions asked of a knowledge base through the API or MCP server are recorded in the same way against the knowledge base, for its owner to read.'
		]
	},
	{
		heading: 'API tokens and MCP',
		paragraphs: [
			'You can connect Claude and other tools to your knowledge base through our API and MCP server, either with a token you mint in the service or by authorising an application through OAuth. A token is a secret: anyone who holds it can do what you can do with it. Keep tokens safe, mint one per tool, and revoke any token or authorisation you no longer need.',
			'You are responsible for what a connected tool does with your access, and for reviewing what an application asks for before you authorise it. We may revoke a token or authorisation that is being misused.'
		]
	},
	{
		heading: 'AI-generated answers',
		paragraphs: [
			'The interviewer’s replies, the brains, chatbot answers, and everything else the service generates is produced by AI. It can be incomplete, out of date, or wrong, and it is not legal, financial, tax, or other professional advice. Check anything important before you act on it. Decisions you make based on the service’s output are yours.'
		]
	},
	{
		heading: 'Sharing',
		paragraphs: [
			'You control who sees your work. Sharing a knowledge base gives the person you name read-only access to it, so share only what you are happy for them to see. You can withdraw a share at any time.'
		]
	}
];
