import { warmthScale } from '$lib/data/knowledge/humanConnections';

export const personSchema = {
	type: 'object',
	required: ['name'],
	properties: {
		name: {
			type: 'string',
			description: 'The person’s name exactly as given — "Sarah Hartley", or "Dave" if that is all.'
		},
		role: { type: 'string', description: 'What they do — "site manager", "client’s QS".' },
		organisation: {
			type: 'string',
			description: 'Who they work for or belong to — "Hartley Homes". Omit when not said.'
		},
		note: { type: 'string', description: 'Anything else worth knowing about them, briefly.' }
	}
};

export const connectionSchema = {
	type: 'object',
	required: ['from', 'to', 'relationship'],
	properties: {
		from: { type: 'string', description: 'One person’s name, as in people.' },
		to: { type: 'string', description: 'The other person’s name, as in people.' },
		relationship: {
			type: 'string',
			description: 'What connects them — "works for", "brother-in-law of", "introduced us to".'
		},
		warmth: {
			type: 'string',
			enum: warmthScale.map((definition) => definition.warmth),
			description:
				'How well they get on: ' +
				warmthScale.map((definition) => `${definition.warmth} — ${definition.meaning}`).join('; ') +
				'. Use neutral when nothing is said about feeling.'
		},
		note: {
			type: 'string',
			description: 'The evidence in the source’s own words — "they fell out over the Fenwick job".'
		}
	}
};

export const peopleHarvestProperty = {
	type: 'array',
	items: personSchema,
	description: 'People NEWLY named — anyone around the business. Empty when none are.'
};

export const connectionsHarvestProperty = {
	type: 'array',
	items: connectionSchema,
	description:
		'Relationships between two named people NEWLY stated, with how well they get on. ' +
		'The owner counts as a person. Empty when none are.'
};
