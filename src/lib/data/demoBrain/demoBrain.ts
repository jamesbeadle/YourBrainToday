import { commercialContext, commercialPages } from './commercialContext';
import { deliveryContext, deliveryPages } from './deliveryContext';
import { financeContext, financePages } from './financeContext';
import { siteOperationsContext, siteOperationsPages } from './siteOperationsContext';
import type {
	BrainContext,
	BrainPage,
	BrainPageLink,
	BrainPageSummary
} from '$lib/data/brainTypes';

const contextMapPage: BrainPage = {
	slug: 'context-map',
	title: 'Context map',
	summary: 'How the four contexts of the firm relate.',
	kind: 'context_map',
	contextSlug: null,
	updatedAt: '2026-08-01T09:00:00Z',
	body: '## The shape of the firm\n\n**Commercial** wins the work and hands a signed contract to **Delivery**, which owns the build from groundworks to handover. **Site operations** runs the ground truth beneath every delivery phase, and **Finance** turns certified progress into cash.\n\nDelivery is the core domain: everything else exists so that a building gets finished.'
};

export const demoContexts: BrainContext[] = [
	deliveryContext,
	commercialContext,
	siteOperationsContext,
	financeContext
];

export const demoPages: BrainPage[] = [
	...deliveryPages,
	...commercialPages,
	...siteOperationsPages,
	...financePages,
	contextMapPage
];

export const demoPageIndex: BrainPageSummary[] = demoPages.map(asSummary);

export const demoPageLinks: BrainPageLink[] = [
	{ fromSlug: 'tender', toSlug: 'project' },
	{ fromSlug: 'contract-signed', toSlug: 'project' },
	{ fromSlug: 'contract-signed', toSlug: 'payment-application' },
	{ fromSlug: 'variation', toSlug: 'valuation' },
	{ fromSlug: 'variation', toSlug: 'site-diary' },
	{ fromSlug: 'phase', toSlug: 'valuation' },
	{ fromSlug: 'phase', toSlug: 'failed-inspection' },
	{ fromSlug: 'handover', toSlug: 'retention' },
	{ fromSlug: 'handover', toSlug: 'snag-list' },
	{ fromSlug: 'snag-list', toSlug: 'retention' },
	{ fromSlug: 'subcontractor', toSlug: 'quoting' },
	{ fromSlug: 'subcontractor', toSlug: 'payment-application' },
	{ fromSlug: 'site-diary', toSlug: 'payment-overdue' },
	{ fromSlug: 'failed-inspection', toSlug: 'variation' }
];

export function findDemoPage(slug: string): BrainPage | null {
	return demoPages.find((page) => page.slug === slug) ?? null;
}

function asSummary(page: BrainPage): BrainPageSummary {
	return {
		slug: page.slug,
		title: page.title,
		summary: page.summary,
		kind: page.kind,
		contextSlug: page.contextSlug
	};
}
