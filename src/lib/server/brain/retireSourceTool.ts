import { pageWriteSchema } from './updateModelTool';

export const retireSourceTool = {
	name: 'retire_source',
	description:
		'Record how the model forgets a retired source document: which pages to delete, which to ' +
		'rewrite without its knowledge, which emptied contexts to delete, and one log line.',
	input_schema: {
		type: 'object',
		required: ['pageDeletes', 'pageWrites', 'logLine'],
		properties: {
			pageDeletes: {
				type: 'array',
				maxItems: 20,
				items: { type: 'string', description: 'Slug of a page whose content came only from this source.' }
			},
			pageWrites: { type: 'array', maxItems: 10, items: pageWriteSchema },
			contextDeletes: {
				type: 'array',
				maxItems: 4,
				items: { type: 'string', description: 'Slug of a bounded context left empty by the deletes.' }
			},
			logLine: { type: 'string', description: 'One line describing what the model forgot.' }
		}
	}
};
