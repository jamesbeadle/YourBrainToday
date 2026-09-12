import { getBrainPagesBySlugs } from '../brain/getBrainPage';
import { parseRequestedSlugs } from '../brain/parseBrainAnswer';
import type { AnthropicMessage, AnthropicToolUseBlock } from '$lib/server/anthropic/anthropicTypes';
import type { ChatbotBrainModel } from './getChatbotBrains';
import type { SupabaseClient } from '@supabase/supabase-js';

type KeyedPage = { key: string; title: string; body: string };

export async function readChatbotPages(
	supabase: SupabaseClient,
	brains: ChatbotBrainModel[],
	readRequests: AnthropicToolUseBlock[]
): Promise<AnthropicMessage> {
	const resultBlocks = [];
	for (const readRequest of readRequests) {
		const requestedKeys = parseRequestedSlugs(readRequest.input);
		const pages = await fetchPages(supabase, brains, requestedKeys);
		resultBlocks.push({
			type: 'tool_result',
			tool_use_id: readRequest.id,
			content: renderPages(requestedKeys, pages)
		});
	}
	return { role: 'user', content: resultBlocks };
}

async function fetchPages(
	supabase: SupabaseClient,
	brains: ChatbotBrainModel[],
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

function renderPages(requestedKeys: string[], pages: KeyedPage[]): string {
	if (pages.length === 0) return 'None of the requested pages exist.';
	const missing = requestedKeys.filter((key) => !pages.some((page) => page.key === key));
	const rendered = pages.map((page) => `# ${page.title} (${page.key})\n\n${page.body}`);
	if (missing.length > 0) rendered.push(`Pages that do not exist: ${missing.join(', ')}`);
	return rendered.join('\n\n---\n\n');
}
