import type { AnthropicResponse } from './anthropicTypes';

export type WebSearchSource = { title: string; url: string };

const searchResultBlock = 'web_search_tool_result';
const searchResultEntry = 'web_search_result';
const pausedTurn = 'pause_turn';

export function webSearchSourcesFrom(response: AnthropicResponse): WebSearchSource[] {
	const byUrl = new Map<string, WebSearchSource>();
	for (const block of response.content) {
		if (block.type !== searchResultBlock) continue;
		const entries = (block as { content?: unknown }).content;
		if (!Array.isArray(entries)) continue;
		for (const entry of entries) {
			const source = sourceFrom(entry);
			if (source !== null && !byUrl.has(source.url)) byUrl.set(source.url, source);
		}
	}
	return [...byUrl.values()];
}

export function isPausedForSearch(response: AnthropicResponse): boolean {
	return response.stop_reason === pausedTurn;
}

function sourceFrom(entry: unknown): WebSearchSource | null {
	if (typeof entry !== 'object' || entry === null) return null;
	const result = entry as Record<string, unknown>;
	if (result.type !== searchResultEntry || typeof result.url !== 'string') return null;
	return { title: String(result.title ?? result.url), url: result.url };
}
