import type { BrainContext, BrainPage } from '$lib/data/brainTypes';

const demoUpdatedAt = '2026-08-01T09:00:00Z';

export const siteOperationsContext: BrainContext = {
	slug: 'site-operations',
	name: 'Site operations',
	summary: 'The daily running of the site — diaries, inspections, and the trades on the ground.',
	isCoreDomain: false
};

export const siteOperationsPages: BrainPage[] = [
	{
		slug: 'site-diary',
		title: 'Site diary',
		summary: 'One entry per site per day — weather, labour, deliveries, and events.',
		kind: 'entity',
		contextSlug: 'site-operations',
		updatedAt: demoUpdatedAt,
		body: '## What it is\n\nThe site manager’s daily record: who was on site, what arrived, what the weather allowed, and anything that will matter in six months when memories differ.\n\n## Why it matters\n\nThe diary is the evidence base for delay claims and variation timing.'
	},
	{
		slug: 'subcontractor',
		title: 'Subcontractor',
		summary: 'A trade firm working under our contract terms.',
		kind: 'entity',
		contextSlug: 'site-operations',
		updatedAt: demoUpdatedAt,
		body: '## What it is\n\nA vetted trade — groundworker, brickwork gang, M&E firm — engaged under a subcontract order. Each carries insurances, RAMS, and an agreed payment schedule.\n\n## The relationship\n\nSubcontractors are priced in Commercial, managed here, and paid by Finance.'
	},
	{
		slug: 'toolbox-talk',
		title: 'Toolbox talk',
		summary: 'The short safety briefing that starts a working week.',
		kind: 'value_object',
		contextSlug: 'site-operations',
		updatedAt: demoUpdatedAt,
		body: '## What it is\n\nA recorded briefing on one hazard — working at height, silica dust, buried services — delivered to everyone on site and signed by every attendee.\n\n## The record\n\nDate, topic, attendees. Kept with the site diary for the HSE’s benefit and ours.'
	},
	{
		slug: 'failed-inspection',
		title: 'Failed inspection',
		summary: 'The event a building inspector rejects the work.',
		kind: 'domain_event',
		contextSlug: 'site-operations',
		updatedAt: demoUpdatedAt,
		body: '## What happens\n\nBuilding control or the warranty inspector rejects an element. The phase pauses, the fix is programmed, and the diary records cause and cost.\n\n## Reacts to it\n\nDelivery holds the phase; Commercial checks whether the failure is a variation or our own account.'
	},
	{
		slug: 'site-operations-glossary',
		title: 'Site operations glossary',
		summary: 'The words shouted across scaffolding.',
		kind: 'glossary',
		contextSlug: 'site-operations',
		updatedAt: demoUpdatedAt,
		body: '## Ubiquitous language\n\n**RAMS** — risk assessments and method statements, the paperwork before the work.\n\n**First fix** — everything buried in the walls before plaster.\n\n**Second fix** — everything you can see after it.\n\n**Making good** — repairing what the work disturbed.'
	}
];
