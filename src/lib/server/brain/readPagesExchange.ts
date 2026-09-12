import { getBrainPagesBySlugs } from './getBrainPage';
import { parseRequestedSlugs } from './parseBrainAnswer';
import type { AnthropicMessage, AnthropicToolUseBlock } from '$lib/server/anthropic/anthropicTypes';
import type { BrainPage } from '$lib/data/brainTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export function toolUseNamed(content: unknown[], name: string): AnthropicToolUseBlock | undefined {
	return toolUsesNamed(content, name)[0];
}

export function toolUsesNamed(content: unknown[], name: string): AnthropicToolUseBlock[] {
	return content.filter(
		(block): block is AnthropicToolUseBlock =>
			(block as AnthropicToolUseBlock).type === 'tool_use' &&
			(block as AnthropicToolUseBlock).name === name
	);
}

export async function readPagesResultMessage(
	supabase: SupabaseClient,
	brainId: string,
	readRequests: AnthropicToolUseBlock[]
): Promise<AnthropicMessage> {
	const resultBlocks = [];
	for (const readRequest of readRequests) {
		resultBlocks.push(await resultBlockFor(supabase, brainId, readRequest));
	}
	return { role: 'user', content: resultBlocks };
}

async function resultBlockFor(
	supabase: SupabaseClient,
	brainId: string,
	readRequest: AnthropicToolUseBlock
) {
	const slugs = parseRequestedSlugs(readRequest.input);
	const pages = await getBrainPagesBySlugs(supabase, brainId, slugs);
	return { type: 'tool_result', tool_use_id: readRequest.id, content: renderPages(slugs, pages) };
}

function renderPages(requestedSlugList: string[], pages: BrainPage[]): string {
	if (pages.length === 0) return 'None of the requested pages exist.';
	const missing = requestedSlugList.filter((slug) => !pages.some((page) => page.slug === slug));
	const rendered = pages.map((page) => `# ${page.title} (${page.slug})\n\n${page.body}`);
	if (missing.length > 0) rendered.push(`Pages that do not exist: ${missing.join(', ')}`);
	return rendered.join('\n\n---\n\n');
}
