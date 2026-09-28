import { clipPromptText } from '../knowledge/reading/clipPromptText';
import { longestRulingInPrompt } from '$lib/data/chatbotRulings';
import type { PromptRuling } from './readChatbotRulings';

export function renderChatbotRulings(rulings: PromptRuling[]): string {
	if (rulings.length === 0) return '';
	return [
		'# Preferred answers',
		'',
		'Whoever runs this bot has set these. When a question means the same as one of them, give',
		'the preferred answer in their words, adding nothing, citing no pages — and it is not a',
		'knowledge gap.',
		'',
		...rulings.map(renderRuling)
	].join('\n');
}

function renderRuling(ruling: PromptRuling): string {
	return `- Q: ${clipPromptText(ruling.question, longestRulingInPrompt)}\n  A: ${clipPromptText(ruling.preferredAnswer, longestRulingInPrompt)}`;
}
