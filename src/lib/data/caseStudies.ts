export type CaseStudyDelivery = {
	name: string;
	description: string;
};

export type CaseStudy = {
	id: string;
	clientName: string;
	clientDescription: string;
	summary: string;
	deliveries: CaseStudyDelivery[];
};

export const jewelBespokeBuildCaseStudy: CaseStudy = {
	id: 'jewel-bespoke-build',
	clientName: 'Jewel Bespoke Build',
	clientDescription: 'A construction firm in Surrey',
	summary:
		'Jewel Bespoke Build builds bespoke homes across Surrey. We learned how the office and the sites hand work to each other, then built the tools that take the repeat work off the team — starting with the way they ask us for things.',
	deliveries: [
		{
			name: 'Client portal',
			description:
				'One place where the team sees the projects we run for them and everything they have asked for.'
		},
		{
			name: 'Request flow',
			description:
				'A request is raised in plain English, discussed in a thread, and once accepted becomes a build the Builder takes on.'
		},
		{
			name: 'MCP connection',
			description:
				'Their own Claude can list projects, raise requests and follow the thread without opening the site.'
		}
	]
};
