import type { AnthropicMessage } from './anthropicTypes';

type SpokenTurn = { speaker: string; text: string };

const userSpeaker = 'user';

/** A conversation as Anthropic reads it: it opens with the user, and each turn alternates from there. */
export function messagesFromTurns(turns: SpokenTurn[]): AnthropicMessage[] {
	const firstUserIndex = turns.findIndex((turn) => turn.speaker === userSpeaker);
	if (firstUserIndex < 0) return [];
	return turns.slice(firstUserIndex).map((turn) => ({
		role: turn.speaker === userSpeaker ? 'user' : 'assistant',
		content: turn.text
	}));
}
