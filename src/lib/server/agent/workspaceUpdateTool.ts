import { workflowModelSchema } from './workflowModelSchema';

const expertiseFactSchema = {
	type: 'string',
	description:
		'One durable rule, term, or constraint of the trade, stated as a standalone sentence.'
};

export const experienceEventSchema = {
	type: 'object',
	required: ['title'],
	properties: {
		title: {
			type: 'string',
			description:
				'The event named in the PAST TENSE, in the trade’s own terms — ' +
				'"Variation order signed off", never "sign-off process".'
		},
		note: { type: 'string', description: 'The detail in the owner’s own words.' },
		occurredAt: {
			type: 'string',
			description: 'ISO date if the owner said when it happened; omit otherwise.'
		},
		caseName: {
			type: 'string',
			description:
				'The job, client, or engagement this event belongs to, exactly as the owner names ' +
				'it — "the Hartley job". Omit when no case is named.'
		},
		terms: {
			type: 'array',
			items: { type: 'string' },
			description: 'The trade concepts this event touches, named as the playbook names them.'
		}
	}
};

export const workspaceUpdateTool = {
	name: 'update_workspace',
	description:
		'Return your conversational reply to the business owner together with the complete ' +
		'updated Process Map model, plus any expertise and experience harvested this turn.',
	input_schema: {
		type: 'object',
		required: ['reply', 'map'],
		properties: {
			reply: { type: 'string', description: 'Your next question or remark, under 120 words.' },
			map: workflowModelSchema,
			expertiseFacts: {
				type: 'array',
				items: expertiseFactSchema,
				description:
					'Durable trade knowledge NEWLY stated in the owner’s latest message — rules, ' +
					'standards, vocabulary. Empty when the message adds none.'
			},
			experienceEvents: {
				type: 'array',
				items: experienceEventSchema,
				description:
					'Things that actually happened, NEWLY stated in the owner’s latest message — ' +
					'jobs, incidents, decisions. Empty when the message adds none.'
			}
		}
	}
};
