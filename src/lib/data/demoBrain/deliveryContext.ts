import type { BrainContext, BrainPage } from '$lib/data/brainTypes';

const demoUpdatedAt = '2026-08-01T09:00:00Z';

export const deliveryContext: BrainContext = {
	slug: 'delivery',
	name: 'Delivery',
	summary: 'How a signed job becomes a finished building — projects, phases, and handover.',
	isCoreDomain: true
};

export const deliveryPages: BrainPage[] = [
	{
		slug: 'project',
		title: 'Project',
		summary: 'The unit of everything — one site, one client, one contract sum.',
		kind: 'aggregate',
		contextSlug: 'delivery',
		updatedAt: demoUpdatedAt,
		body: '## What it is\n\nA project is one client engagement on one site, from breaking ground to handover. It owns its phases, its variations, and its snag list — nothing about a project lives outside it.\n\n## What it holds\n\nContract sum, programme dates, the assigned site manager, and the running phase. A project closes only when the snag list is empty and retention is agreed.'
	},
	{
		slug: 'phase',
		title: 'Phase',
		summary: 'A stage of the programme — groundworks, frame, first fix, finishes.',
		kind: 'entity',
		contextSlug: 'delivery',
		updatedAt: demoUpdatedAt,
		body: '## What it is\n\nA phase is a named stage of the build programme with its own start, finish, and sign-off. Phases run in sequence; a phase cannot complete while its predecessor is open.\n\n## Why it matters\n\nValuations, drawdowns, and site inspections all hang off phase completion.'
	},
	{
		slug: 'handover',
		title: 'Handover',
		summary: 'The moment the building becomes the client’s — keys, manuals, warranties.',
		kind: 'domain_event',
		contextSlug: 'delivery',
		updatedAt: demoUpdatedAt,
		body: '## What happens\n\nPractical completion is certified, the O&M manuals are issued, and the defects liability period begins. Handover triggers the release of the first retention half.\n\n## Reacts to it\n\nFinance raises the penultimate application; the snag list moves to the defects register.'
	},
	{
		slug: 'snag-list',
		title: 'Snag list',
		summary: 'Every defect found at completion, tracked until closed.',
		kind: 'value_object',
		contextSlug: 'delivery',
		updatedAt: demoUpdatedAt,
		body: '## What it is\n\nThe list of defects recorded at practical completion inspection. Each snag names a location, a trade, and a fix-by date.\n\n## Rule of thumb\n\nNo snag, no story: an empty snag list is the only acceptable end state before final account.'
	},
	{
		slug: 'delivery-glossary',
		title: 'Delivery glossary',
		summary: 'The words the site actually uses.',
		kind: 'glossary',
		contextSlug: 'delivery',
		updatedAt: demoUpdatedAt,
		body: '## Ubiquitous language\n\n**PC** — practical completion, the day the client takes the building.\n\n**Programme** — the phase-by-phase schedule agreed at contract.\n\n**Snag** — a defect found at inspection, small enough to fix without a variation.\n\n**DLP** — defects liability period, usually twelve months after PC.'
	}
];
