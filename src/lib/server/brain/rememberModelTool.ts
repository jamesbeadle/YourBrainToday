import { contextWriteSchema, pageWriteSchema } from './updateModelTool';

export const rememberModelTool = {
	name: 'remember_from_chat',
	description:
		'Record what the conversation asks the model to remember: any bounded context it creates ' +
		'or reshapes, every page write it demands, the reply the person sees, and one log line.',
	input_schema: {
		type: 'object',
		required: ['pageWrites', 'replyMarkdown', 'logLine'],
		properties: {
			contextWrites: { type: 'array', maxItems: 2, items: contextWriteSchema },
			pageWrites: { type: 'array', maxItems: 4, items: pageWriteSchema },
			replyMarkdown: {
				type: 'string',
				description:
					'The sentence or two shown in the chat: what was noted and that the owner reviews it.'
			},
			logLine: { type: 'string', description: 'One line describing what you did.' }
		}
	}
};
