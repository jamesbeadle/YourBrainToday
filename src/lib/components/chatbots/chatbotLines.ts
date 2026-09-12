import type { ChatbotMessage, ChatbotSpeaker } from '$lib/data/chatbotTypes';

export type ChatbotLine = { id: string; speaker: ChatbotSpeaker; body: string };

export function lineFromMessage(message: ChatbotMessage): ChatbotLine {
	return { id: message.id, speaker: message.speaker, body: message.body };
}

export function freshLine(speaker: ChatbotSpeaker, body: string, ordinal: number): ChatbotLine {
	return { id: `${Date.now()}-${ordinal}`, speaker, body };
}
