import { domainBlockLabels } from '$lib/data/domainBlocks';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { BrainContext, BrainPageSummary } from '$lib/data/brainTypes';

export async function getBrainPageIndex(
	supabase: SupabaseClient,
	brainId: string
): Promise<BrainPageSummary[]> {
	const { data, error } = await supabase
		.from('brain_pages')
		.select('slug, title, summary, kind, context_slug')
		.eq('brain_id', brainId)
		.order('kind')
		.order('title');
	if (error !== null) throw error;
	return (data ?? []).map((row) => ({
		slug: row.slug,
		title: row.title,
		summary: row.summary,
		kind: row.kind,
		contextSlug: row.context_slug
	}));
}

export function renderDomainModelIndex(
	contexts: BrainContext[],
	index: BrainPageSummary[]
): string {
	if (contexts.length === 0 && index.length === 0) {
		return 'The model is empty — no bounded contexts or pages exist yet.';
	}
	const sections = contexts.map((context) => renderContext(context, index));
	const strays = index.filter((page) => isOutsideEveryContext(page, contexts));
	if (strays.length > 0) sections.push(renderStrays(strays));
	return sections.join('\n\n');
}

function renderContext(context: BrainContext, index: BrainPageSummary[]): string {
	const marker = context.isCoreDomain ? ' — CORE DOMAIN' : '';
	const header = `### Bounded context: ${context.name} [${context.slug}]${marker}\n${context.summary}`;
	const lines = index.filter((page) => page.contextSlug === context.slug).map(renderPageLine);
	if (lines.length === 0) return `${header}\n- (no pages yet)`;
	return [header, ...lines].join('\n');
}

function renderStrays(strays: BrainPageSummary[]): string {
	return ['### Model-level pages', ...strays.map(renderPageLine)].join('\n');
}

function renderPageLine(page: BrainPageSummary): string {
	const kindLabel = domainBlockLabels[page.kind].singular;
	return `- ${page.slug} [${kindLabel}] — ${page.title}: ${page.summary}`;
}

function isOutsideEveryContext(page: BrainPageSummary, contexts: BrainContext[]): boolean {
	if (page.contextSlug === null) return true;
	return !contexts.some((context) => context.slug === page.contextSlug);
}
