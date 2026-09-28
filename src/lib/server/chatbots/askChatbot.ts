import { chatbotAnswerTool } from './chatbotAnswerTool';
import { chatbotQueryPrompt } from './chatbotQueryPrompt';
import { parseChatbotAnswer } from './parseChatbotAnswer';
import { readThenAnswer } from '../knowledge/reading/readThenAnswer';
import { renderKnowledgeBase } from '../knowledge/reading/renderKnowledgeBase';
import type { AnthropicMessage } from '$lib/server/anthropic/anthropicTypes';
import type { ChatbotAnswer, ChatbotSpeaker } from '$lib/data/chatbotTypes';
import type { KnowledgeBaseReading } from '../knowledge/reading/readKnowledgeBase';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ChatbotTurn = { speaker: ChatbotSpeaker; text: string };

export async function askChatbot(
	supabase: SupabaseClient,
	chatbot: { name: string; modelId: string },
	knowledge: KnowledgeBaseReading,
	turns: ChatbotTurn[]
): Promise<ChatbotAnswer> {
	const system = `${chatbotQueryPrompt(chatbot.name)}\n\n# The knowledge base\n\n${renderKnowledgeBase(knowledge)}`;
	const answerCall = await readThenAnswer(supabase, knowledge, {
		system,
		messages: messagesFromTurns(turns),
		answerTool: chatbotAnswerTool,
		model: chatbot.modelId
	});
	return parseChatbotAnswer(answerCall?.input, latestMemberQuestion(turns));
}

function latestMemberQuestion(turns: ChatbotTurn[]): string {
	for (let index = turns.length - 1; index >= 0; index -= 1) {
		if (turns[index].speaker === 'member') return turns[index].text;
	}
	return '';
}

function messagesFromTurns(turns: ChatbotTurn[]): AnthropicMessage[] {
	const firstMemberIndex = turns.findIndex((turn) => turn.speaker === 'member');
	if (firstMemberIndex < 0) return [];
	return turns.slice(firstMemberIndex).map((turn) => ({
		role: turn.speaker === 'member' ? 'user' : 'assistant',
		content: turn.text
	}));
}
