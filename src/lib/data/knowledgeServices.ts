export type KnowledgeService = {
	id: string;
	name: string;
	tagline: string;
	description: string;
	isLive: boolean;
	href?: string;
};

export const knowledgeServices: KnowledgeService[] = [
	{
		id: 'chatbots',
		name: 'Chatbots',
		tagline: 'Hand your knowledge to your staff',
		description:
			'Set up a chatbot on your knowledge base, invite your staff by email, and they ask it instead of asking you. You fund it from your credits, decide how much each person may spend, and see the questions it could not answer.',
		isLive: true,
		href: '/knowledge-base'
	},
	{
		id: 'connect-your-tools',
		name: 'Connect your tools',
		tagline: 'Your knowledge, inside Claude',
		description:
			'An MCP server and API put your knowledge base inside Claude and the other tools you already use. Mint a token, paste the address, and your own assistant reads from what you know.',
		isLive: true,
		href: '/knowledge-base'
	}
];
