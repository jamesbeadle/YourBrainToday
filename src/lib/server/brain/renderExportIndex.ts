import { domainBlockLabels } from '$lib/data/domainBlocks';
import type { BrainContext, BrainEvent, BrainPageSummary } from '$lib/data/brainTypes';

export function renderExportIndex(
	contexts: BrainContext[],
	pages: BrainPageSummary[]
): string {
	const sections = contexts.map((context) => renderContextSection(context, pages));
	const strays = pages.filter((page) => isOutsideEveryContext(page, contexts));
	if (strays.length > 0) {
		sections.push(['## Model-level pages', '', ...strays.map((page) => renderPageLine(page, ''))].join('\n'));
	}
	return ['# Expertise brain — index', '', ...sections].join('\n') + '\n';
}

export function renderExportLog(events: BrainEvent[]): string {
	const lines = events.map((event) => `- ${event.createdAt} — ${describeEvent(event)}`);
	return ['# Expertise brain — log', '', ...lines].join('\n') + '\n';
}

function renderContextSection(context: BrainContext, pages: BrainPageSummary[]): string {
	const marker = context.isCoreDomain ? ' (core domain)' : '';
	const lines = pages
		.filter((page) => page.contextSlug === context.slug)
		.map((page) => renderPageLine(page, `${context.slug}/`));
	return [`## ${context.name}${marker}`, '', context.summary, '', ...lines, ''].join('\n');
}

function renderPageLine(page: BrainPageSummary, pathPrefix: string): string {
	const kindLabel = domainBlockLabels[page.kind].singular;
	return `- [${page.title}](${pathPrefix}${page.slug}.md) — ${kindLabel}: ${page.summary}`;
}

function isOutsideEveryContext(page: BrainPageSummary, contexts: BrainContext[]): boolean {
	if (page.contextSlug === null) return true;
	return !contexts.some((context) => context.slug === page.contextSlug);
}

function describeEvent(event: BrainEvent): string {
	if (event.kind === 'source_ingested') return String(event.detail.logLine ?? 'Source read');
	if (event.kind === 'context_created') return `Context created: ${String(event.detail.contextSlug ?? '')}`;
	if (event.kind === 'context_updated') return `Context updated: ${String(event.detail.contextSlug ?? '')}`;
	if (event.kind === 'page_created') return `Page created: ${event.pageSlug}`;
	if (event.kind === 'page_updated') return `Page updated: ${event.pageSlug}`;
	if (event.kind === 'brain_exported') return 'Exported the brain as Markdown';
	return `Question answered: ${String(event.detail.question ?? '')}`;
}
