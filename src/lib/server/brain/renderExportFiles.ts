import { renderExportIndex, renderExportLog } from './renderExportIndex';
import type { BrainContext, BrainEvent, BrainPage } from '$lib/data/brainTypes';

export function renderExportFiles(
	contexts: BrainContext[],
	pages: BrainPage[],
	events: BrainEvent[]
): Record<string, string> {
	const files: Record<string, string> = {
		'index.md': renderExportIndex(contexts, pages),
		'log.md': renderExportLog(events)
	};
	for (const page of pages) {
		files[exportPathFor(page, contexts)] = renderPageMarkdown(page, contexts);
	}
	return files;
}

function exportPathFor(page: BrainPage, contexts: BrainContext[]): string {
	if (!hasKnownContext(page, contexts)) return `${page.slug}.md`;
	return `${page.contextSlug}/${page.slug}.md`;
}

function renderPageMarkdown(page: BrainPage, contexts: BrainContext[]): string {
	const frontmatterLines = [
		'---',
		`title: ${quoteForYaml(page.title)}`,
		`summary: ${quoteForYaml(page.summary)}`,
		`kind: ${page.kind}`,
		...(hasKnownContext(page, contexts) ? [`context: ${page.contextSlug}`] : []),
		`updated: ${page.updatedAt}`,
		'---'
	];
	return `${frontmatterLines.join('\n')}\n\n${page.body}\n`;
}

function hasKnownContext(page: BrainPage, contexts: BrainContext[]): boolean {
	return contexts.some((context) => context.slug === page.contextSlug);
}

function quoteForYaml(text: string): string {
	return `"${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}
