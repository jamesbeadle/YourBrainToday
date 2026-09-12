import { faceExpressionNames } from '$lib/data/faceChatTypes';

export const speakTool = {
	name: 'speak',
	description: 'Deliver the spoken reply for the face to perform, grounded in any pages read.',
	input_schema: {
		type: 'object',
		required: ['reply', 'expression', 'citedSlugs'],
		properties: {
			reply: {
				type: 'string',
				description: 'One to three short spoken sentences of plain prose — no markdown.'
			},
			expression: { type: 'string', enum: [...faceExpressionNames] },
			citedSlugs: { type: 'array', items: { type: 'string' } }
		}
	}
};
