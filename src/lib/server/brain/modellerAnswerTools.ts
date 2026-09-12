const maxPagesPerRead = 10;

export const readPagesTool = {
	name: 'read_pages',
	description: 'Fetch the full bodies of model pages by slug before answering.',
	input_schema: {
		type: 'object',
		required: ['slugs'],
		properties: {
			slugs: { type: 'array', maxItems: maxPagesPerRead, items: { type: 'string' } }
		}
	}
};

export const answerTool = {
	name: 'answer',
	description: 'Deliver the final answer, grounded in the pages read.',
	input_schema: {
		type: 'object',
		required: ['answerMarkdown', 'citedSlugs'],
		properties: {
			answerMarkdown: { type: 'string' },
			citedSlugs: { type: 'array', items: { type: 'string' } }
		}
	}
};
