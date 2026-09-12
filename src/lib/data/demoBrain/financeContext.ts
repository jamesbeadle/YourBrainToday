import type { BrainContext, BrainPage } from '$lib/data/brainTypes';

const demoUpdatedAt = '2026-08-01T09:00:00Z';

export const financeContext: BrainContext = {
	slug: 'finance',
	name: 'Finance',
	summary: 'Money in and out — applications, valuations, retention, and cashflow.',
	isCoreDomain: false
};

export const financePages: BrainPage[] = [
	{
		slug: 'payment-application',
		title: 'Payment application',
		summary: 'The monthly ask — work done to date, priced and evidenced.',
		kind: 'entity',
		contextSlug: 'finance',
		updatedAt: demoUpdatedAt,
		body: '## What it is\n\nThe monthly application for payment: measured work complete, materials on site, and agreed variations, less what has already been paid.\n\n## The rhythm\n\nApplication, valuation, certificate, payment — the four beats of construction cashflow.'
	},
	{
		slug: 'valuation',
		title: 'Valuation',
		summary: 'What the quantity surveyor certifies the work is worth.',
		kind: 'domain_service',
		contextSlug: 'finance',
		updatedAt: demoUpdatedAt,
		body: '## The process\n\nThe QS walks the site against the application, agrees percentages phase by phase, and certifies a figure. The valuation, not the application, is what gets paid.\n\n## The tension\n\nOptimism in the application meets measurement in the valuation.'
	},
	{
		slug: 'retention',
		title: 'Retention',
		summary: 'The slice held back until the defects are done.',
		kind: 'value_object',
		contextSlug: 'finance',
		updatedAt: demoUpdatedAt,
		body: '## What it is\n\nTypically five per cent held from every certificate: half released at practical completion, half at the end of the defects liability period.\n\n## Why it exists\n\nRetention is the client’s insurance that the snag list gets finished.'
	},
	{
		slug: 'payment-overdue',
		title: 'Payment overdue',
		summary: 'The event a certified sum goes unpaid past its final date.',
		kind: 'domain_event',
		contextSlug: 'finance',
		updatedAt: demoUpdatedAt,
		body: '## What happens\n\nThe final date for payment passes without money landing. Notice goes to the client, site slows to statutory pace, and the directors start reading the contract’s suspension clause.\n\n## Reacts to it\n\nDelivery reviews programme exposure; Commercial drafts the notice.'
	},
	{
		slug: 'finance-glossary',
		title: 'Finance glossary',
		summary: 'The language of getting paid.',
		kind: 'glossary',
		contextSlug: 'finance',
		updatedAt: demoUpdatedAt,
		body: '## Ubiquitous language\n\n**Application** — the monthly request for payment.\n\n**Certificate** — the sum the contract administrator agrees is due.\n\n**Retention** — the held-back slice that keeps everyone honest.\n\n**Final account** — the last agreement of what the whole job was worth.'
	}
];
