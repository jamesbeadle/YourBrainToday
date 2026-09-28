import { answerTool } from '$lib/server/brain/modellerAnswerTools';
import { everyKnowledgeKind } from '$lib/data/knowledge/knowledgeKinds';

export const orchestratorAnswerTool = {
	name: answerTool.name,
	description: 'Deliver the final answer, grounded in the brains consulted.',
	input_schema: {
		type: 'object',
		required: ['answerMarkdown', 'citedSlugs', 'brainsConsulted'],
		properties: {
			...answerTool.input_schema.properties,
			brainsConsulted: {
				type: 'array',
				items: { type: 'string', enum: everyKnowledgeKind },
				description: 'Every brain the answer drew on, by kind.'
			}
		}
	}
};
