import type { BrainContext, BrainPage } from '$lib/data/brainTypes';

const demoUpdatedAt = '2026-08-01T09:00:00Z';

export const commercialContext: BrainContext = {
	slug: 'commercial',
	name: 'Commercial',
	summary: 'Winning work and protecting margin — tenders, contracts, and variations.',
	isCoreDomain: false
};

export const commercialPages: BrainPage[] = [
	{
		slug: 'tender',
		title: 'Tender',
		summary: 'A priced offer to build — the front door of every project.',
		kind: 'entity',
		contextSlug: 'commercial',
		updatedAt: demoUpdatedAt,
		body: '## What it is\n\nA tender is a priced, programmed offer against a client’s enquiry. It carries the bill of quantities, the preliminaries, and the margin the estimator dares to hope for.\n\n## Where it goes\n\nA won tender becomes a project in Delivery; a lost one feeds the win-rate review.'
	},
	{
		slug: 'quoting',
		title: 'Quoting',
		summary: 'Turning an enquiry into a defensible price.',
		kind: 'domain_service',
		contextSlug: 'commercial',
		updatedAt: demoUpdatedAt,
		body: '## The process\n\nTake-offs from the drawings, subcontractor prices gathered, preliminaries built up, margin applied. Quoting owns the price until the tender is submitted.\n\n## The discipline\n\nEvery rate traces to a supplier quote or the price book — never a guess in the bill.'
	},
	{
		slug: 'variation',
		title: 'Variation',
		summary: 'A change to the works after contract — scope, price, and time.',
		kind: 'entity',
		contextSlug: 'commercial',
		updatedAt: demoUpdatedAt,
		body: '## What it is\n\nAn instructed change to the contracted works. A variation is not real until it has an instruction in writing, a price, and an agreed effect on the programme.\n\n## The golden rule\n\nNo instruction, no work. Verbal variations are how margin dies.'
	},
	{
		slug: 'contract-signed',
		title: 'Contract signed',
		summary: 'The event that turns a tender into a project.',
		kind: 'domain_event',
		contextSlug: 'commercial',
		updatedAt: demoUpdatedAt,
		body: '## What happens\n\nThe client executes the contract; the tender sum becomes the contract sum. Delivery opens the project, Finance opens the payment schedule, and the estimator’s file goes to the quantity surveyor.'
	},
	{
		slug: 'commercial-glossary',
		title: 'Commercial glossary',
		summary: 'The language of the deal.',
		kind: 'glossary',
		contextSlug: 'commercial',
		updatedAt: demoUpdatedAt,
		body: '## Ubiquitous language\n\n**BoQ** — bill of quantities, the priced list of everything to be built.\n\n**Prelims** — the cost of running the site rather than building the building.\n\n**Margin** — what is left when the job is honest.\n\n**VO** — variation order, a written instruction to change the works.'
	}
];
