import type { LegalSection } from '$lib/data/legalDocument';

export const termsProductSections: LegalSection[] = [
	{
		heading: 'Knowledge bases and the three brains',
		paragraphs: [
			'A knowledge base holds what we learn about a business in three kinds of brain: an expertise brain for the rules and language of the trade, an experience brain for the record of jobs, events and decisions, and a process brain for how the work moves. You build them by answering the interviewer or by uploading documents, and the service reads what you give it and files it in the right brain.',
			'Everything you put into a knowledge base — the documents you upload, the answers you give, and the brains built from them — remains yours. You grant us the licence we need to host, process, and display that content in order to run the service for you, and for nothing else. Your content is never sold, never pooled with other customers’ content, and never used to train models for anyone else. You can export an expertise brain as Markdown at any time, free of charge.',
			'You are responsible for having the right to upload what you upload, including any personal data it contains about other people, and for telling those people where the law requires it.'
		]
	},
	{
		heading: 'Chatbots',
		paragraphs: [
			'A chatbot lets people you choose ask a knowledge base without opening it. When you set one up you are its manager: you fund it from your own credits, invite members by their email address, and decide how much each member may spend. Members sign in with the invited address and are bound by these terms when they do.',
			'Every question a member asks and every answer the chatbot gives is stored against the chatbot, and the manager can see them. Questions the knowledge base could not answer are shown to the manager so the gap can be filled. To generate an answer, the question and the relevant parts of the knowledge base are sent to Anthropic. As manager you must tell your members this before you invite them, and you must not use a chatbot to monitor people in ways the law does not allow.',
			'You can remove a member, stop funding a chatbot, or delete it at any time. Deleting a chatbot deletes its conversations.'
		]
	},
	{
		heading: 'The client portal and requests',
		paragraphs: [
			'If we work for your business, we open the client portal to the people you name. There they can see the projects we run for you, raise requests in plain English, and follow each request through discussion, acceptance, and build. A request is a request: it becomes work only when we accept it, and the written agreement for your engagement governs what that acceptance means.',
			'Contacts you name are invited by email. You are responsible for naming the right people and for telling us when someone should no longer have access.'
		]
	},
	{
		heading: 'API tokens and MCP',
		paragraphs: [
			'You can connect Claude and other tools to your knowledge base or the client portal through our API and MCP server, either with a token you mint in the service or by authorising an application through OAuth. A token is a secret: anyone who holds it can do what you can do with it. Keep tokens safe, mint one per tool, and revoke any token or authorisation you no longer need.',
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
