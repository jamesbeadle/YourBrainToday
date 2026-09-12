export type ConsultancyStep = {
	id: string;
	name: string;
	description: string;
	accentClass: string;
};

export const consultancySteps: ConsultancyStep[] = [
	{
		id: 'learn',
		name: 'We learn how it really runs',
		description:
			'We interview the people who do the work and read the documents you already have. What we learn goes into your knowledge base, in your own language — not a template.',
		accentClass: 'bg-signal'
	},
	{
		id: 'automate',
		name: 'We automate the work that repeats',
		description:
			'The chasing, the retyping, the handovers that stall. We pick the work that repeats and build the tools that take it on, one request at a time, through your own client portal.',
		accentClass: 'bg-go'
	},
	{
		id: 'keep',
		name: 'You keep the knowledge',
		description:
			'You end up with a business that runs with less of you in it, and a knowledge base you can hand to your staff as a chatbot, connect to Claude, or take with you.',
		accentClass: 'bg-caution'
	}
];
