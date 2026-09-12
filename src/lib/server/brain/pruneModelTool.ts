import { contextWriteSchema, pageWriteSchema } from './updateModelTool';

export const pruneModelTool = {
	name: 'prune_model',
	description:
		'Record everything this pruning pass repairs: what was found, any bounded context ' +
		'writes, every page write the repairs demand, the pages the merges retire, and one ' +
		'log line.',
	input_schema: {
		type: 'object',
		required: ['findings', 'pageWrites', 'logLine'],
		properties: {
			findings: {
				type: 'string',
				description: 'A few lines describing what the audit found, or that the model is healthy.'
			},
			contextWrites: { type: 'array', maxItems: 4, items: contextWriteSchema },
			pageWrites: { type: 'array', maxItems: 12, items: pageWriteSchema },
			pageRetires: {
				type: 'array',
				maxItems: 12,
				items: {
					type: 'string',
					description:
						'Slug of an existing page this pruning supersedes — its knowledge must be folded ' +
						'into pages written in this same call.'
				}
			},
			logLine: { type: 'string', description: 'One line describing what you did.' }
		}
	}
};
