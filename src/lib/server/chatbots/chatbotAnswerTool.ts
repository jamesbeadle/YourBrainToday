import { answerTool } from '../brain/modellerAnswerTools';

export const chatbotAnswerTool = {
	name: answerTool.name,
	description:
		'Deliver the final answer, grounded in the pages read, and say whether the knowledge base ' +
		'could answer the question.',
	input_schema: {
		type: 'object',
		required: ['answerMarkdown', 'citedSlugs', 'isKnowledgeGap', 'missingKnowledge'],
		properties: {
			...answerTool.input_schema.properties,
			isKnowledgeGap: {
				type: 'boolean',
				description:
					'True whenever the pages could not answer the question — in full or in part, ' +
					'including anything you added from general knowledge, questions about you, and ' +
					'questions outside the knowledge base. False only when the pages answered it, or ' +
					'for a greeting or thanks.'
			},
			missingKnowledge: {
				type: 'string',
				description:
					'When isKnowledgeGap is true: the one question the knowledge base owner needs to ' +
					'answer, in a line, phrased so they can answer it directly. An empty string when false.'
			}
		}
	}
};
