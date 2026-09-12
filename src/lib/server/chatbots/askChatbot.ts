import { chatbotAnswerTool } from './chatbotAnswerTool';
import { chatbotQueryPrompt } from './chatbotQueryPrompt';
import { parseChatbotAnswer } from './parseChatbotAnswer';
import { readPagesTool } from '../brain/modellerAnswerTools';
import { readChatbotPages } from './readChatbotPages';
import { renderChatbotKnowledge } from './renderChatbotKnowledge';
import { requestAnthropic } from '$lib/server/anthropic/requestAnthropic';
import { toolUseNamed, toolUsesNamed } from '../brain/readPagesExchange';
import type { AnthropicMessage } from '$lib/server/anthropic/anthropicTypes';
import type { ChatbotAnswer, ChatbotSpeaker } from '$lib/data/chatbotTypes';
import type { ChatbotKnowledge } from './getChatbotKnowledge';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ChatbotTurn = { speaker: ChatbotSpeaker; text: string };

const maxAnswerTokens = 4000;
const replyLogLimit = 600;

export async function askChatbot(
	supabase: SupabaseClient,
	chatbot: { name: string; modelId: string },
	knowledge: ChatbotKnowledge,
	turns: ChatbotTurn[]
): Promise<ChatbotAnswer> {
	const system = `${chatbotQueryPrompt(chatbot.name)}\n\n# The knowledge base\n\n${renderChatbotKnowledge(knowledge)}`;
	const question = latestMemberQuestion(turns);
	const messages = messagesFromTurns(turns);
	const firstResponse = await requestAnthropic({
		system,
		messages,
		tools: [readPagesTool, chatbotAnswerTool],
		mustUseTool: true,
		maxTokens: maxAnswerTokens,
		model: chatbot.modelId
	});
	const hasImmediateAnswer =
		toolUseNamed(firstResponse.content, chatbotAnswerTool.name) !== undefined;
	const readRequests = hasImmediateAnswer
		? []
		: toolUsesNamed(firstResponse.content, readPagesTool.name);
	if (readRequests.length === 0) return answerFrom(firstResponse.content, question);
	messages.push({ role: 'assistant', content: firstResponse.content });
	messages.push(await readChatbotPages(supabase, knowledge.brains, readRequests));
	const secondResponse = await requestAnthropic({
		system,
		messages,
		tools: [readPagesTool, chatbotAnswerTool],
		forcedToolName: chatbotAnswerTool.name,
		maxTokens: maxAnswerTokens,
		model: chatbot.modelId
	});
	return answerFrom(secondResponse.content, question);
}

function answerFrom(content: unknown[], question: string): ChatbotAnswer {
	const answerCall = toolUseNamed(content, chatbotAnswerTool.name);
	if (answerCall === undefined) {
		console.error('Chatbot reply held no answer tool call', JSON.stringify(content).slice(0, replyLogLimit));
	}
	return parseChatbotAnswer(answerCall?.input, question);
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
