import type { AnthropicServerTool } from './anthropicTypes';

export const webSearchToolName = 'web_search';

const webSearchToolType = 'web_search_20250305';
const unitedKingdom = 'GB';
const londonTimezone = 'Europe/London';

export function webSearchTool(mostSearches: number): AnthropicServerTool {
	return {
		type: webSearchToolType,
		name: webSearchToolName,
		max_uses: mostSearches,
		user_location: { type: 'approximate', country: unitedKingdom, timezone: londonTimezone }
	};
}
