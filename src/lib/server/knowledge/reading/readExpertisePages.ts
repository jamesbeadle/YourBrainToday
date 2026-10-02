import { getBrainPagesBySlugs } from '../../brain/getBrainPage';
import { parseRequestedSlugs } from '../../brain/parseBrainAnswer';
import type { AnthropicToolUseBlock } from '$lib/server/anthropic/anthropicTypes';
import type { ExpertiseBrainModel } from './readExpertiseBrains';
import type { SupabaseClient } from '@supabase/supabase-js';

export type KeyedPage = { key: string; title: string; body: string };

export type PagesReadResult = { resultBlock: unknown; keysRead: string[] };

// Every expertise page is addressed by its key, brain-handle/page-slug, so
// one request can span the knowledge base's expertise brains. The keys that
// came back are the pages the model has truly read.
export async function readExpertisePages(
	supabase: SupabaseClient,
	brains: ExpertiseBrainModel[],
	readRequest: AnthropicToolUseBlock
): Promise<PagesReadResult> {
	const requestedKeys = parseRequestedSlugs(readRequest.input);
	const pages = await fetchKeyedPages(supabase, brains, requestedKeys);
	return {
		resultBlock: {
			type: 'tool_result',
			tool_use_id: readRequest.id,
			content: renderKeyedPages(requestedKeys, pages)
		},
		keysRead: pages.map((page) => page.key)
	};
}

export async function fetchKeyedPages(
	supabase: SupabaseClient,
	brains: ExpertiseBrainModel[],
	keys: string[]
): Promise<KeyedPage[]> {
	const pages: KeyedPage[] = [];
	for (const brain of brains) {
		const prefix = `${brain.handle}/`;
		const slugs = keys.filter((key) => key.startsWith(prefix)).map((key) => key.slice(prefix.length));
		const found = await getBrainPagesBySlugs(supabase, brain.brainId, slugs);
		pages.push(...found.map((page) => ({ key: `${prefix}${page.slug}`, title: page.title, body: page.body })));
	}
	return pages;
}

export function renderKeyedPages(requestedKeys: string[], pages: KeyedPage[]): string {
	if (pages.length === 0) return 'None of the requested pages exist.';
	const missing = requestedKeys.filter((key) => !pages.some((page) => page.key === key));
	const rendered = pages.map((page) => `# ${page.title} (${page.key})\n\n${page.body}`);
	if (missing.length > 0) rendered.push(`Pages that do not exist: ${missing.join(', ')}`);
	return rendered.join('\n\n---\n\n');
}
