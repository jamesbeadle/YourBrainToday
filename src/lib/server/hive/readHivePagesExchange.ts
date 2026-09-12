import { parseRequestedSlugs } from '../brain/parseBrainAnswer';
import type { AnthropicMessage, AnthropicToolUseBlock } from '$lib/server/anthropic/anthropicTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export type HivePageRead = {
	memberId: string;
	handle: string;
	slug: string;
	title: string;
	body: string;
};

export type HivePagesExchange = { resultMessage: AnthropicMessage; pages: HivePageRead[] };

export async function readHivePages(
	supabase: SupabaseClient,
	readRequests: AnthropicToolUseBlock[]
): Promise<HivePagesExchange> {
	const resultBlocks = [];
	const pagesRead: HivePageRead[] = [];
	for (const readRequest of readRequests) {
		const requestedKeys = parseRequestedSlugs(readRequest.input);
		const pages = await fetchHivePages(supabase, requestedKeys);
		pagesRead.push(...pages);
		resultBlocks.push({
			type: 'tool_result',
			tool_use_id: readRequest.id,
			content: renderPages(requestedKeys, pages)
		});
	}
	return { resultMessage: { role: 'user', content: resultBlocks }, pages: pagesRead };
}

async function fetchHivePages(
	supabase: SupabaseClient,
	pageKeys: string[]
): Promise<HivePageRead[]> {
	if (pageKeys.length === 0) return [];
	const { data, error } = await supabase.rpc('hive_mind_read_pages', { page_keys: pageKeys });
	if (error !== null) throw error;
	return (data ?? []).map((row: Record<string, unknown>) => ({
		memberId: row.member_id as string,
		handle: row.handle as string,
		slug: row.slug as string,
		title: row.title as string,
		body: row.body as string
	}));
}

export function pagesReadByMember(pages: HivePageRead[]): Map<string, number> {
	const counts = new Map<string, number>();
	for (const page of pages) {
		counts.set(page.memberId, (counts.get(page.memberId) ?? 0) + 1);
	}
	return counts;
}

function renderPages(requestedKeys: string[], pages: HivePageRead[]): string {
	if (pages.length === 0) return 'None of the requested pages exist.';
	const missing = requestedKeys.filter(
		(key) => !pages.some((page) => `${page.handle}/${page.slug}` === key)
	);
	const rendered = pages.map(
		(page) => `# ${page.title} (${page.handle}/${page.slug})\n\n${page.body}`
	);
	if (missing.length > 0) rendered.push(`Pages that do not exist: ${missing.join(', ')}`);
	return rendered.join('\n\n---\n\n');
}
