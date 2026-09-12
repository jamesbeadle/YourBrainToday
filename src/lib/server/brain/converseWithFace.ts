import { faceConversationPrompt } from './faceConversationPrompt';
import { readPagesTool } from './modellerAnswerTools';
import { speakTool } from './faceConversationTools';
import { parseSpokenReply } from './parseSpokenReply';
import { readPagesResultMessage, toolUseNamed, toolUsesNamed } from './readPagesExchange';
import { renderDomainModelIndex } from './getBrainPageIndex';
import { requestAnthropic } from '$lib/server/anthropic/requestAnthropic';
import type { AnthropicMessage } from '$lib/server/anthropic/anthropicTypes';
import type { BrainContext, BrainPageSummary } from '$lib/data/brainTypes';
import type { FaceChatReply, FaceChatTurn } from '$lib/data/faceChatTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

const maxReplyTokens = 2000;

export async function converseWithFace(
	supabase: SupabaseClient,
	brainId: string,
	contexts: BrainContext[],
	index: BrainPageSummary[],
	turns: FaceChatTurn[]
): Promise<FaceChatReply> {
	const system = `${faceConversationPrompt}\n\n## Model index\n\n${renderDomainModelIndex(contexts, index)}`;
	const messages = messagesFromTurns(turns);
	const firstResponse = await requestAnthropic({
		system,
		messages,
		tools: [readPagesTool, speakTool],
		maxTokens: maxReplyTokens
	});
	const hasImmediateReply = toolUseNamed(firstResponse.content, speakTool.name) !== undefined;
	const readRequests = hasImmediateReply
		? []
		: toolUsesNamed(firstResponse.content, readPagesTool.name);
	if (readRequests.length === 0) {
		return parseSpokenReply(toolUseNamed(firstResponse.content, speakTool.name)?.input);
	}
	messages.push({ role: 'assistant', content: firstResponse.content });
	messages.push(await readPagesResultMessage(supabase, brainId, readRequests));
	const secondResponse = await requestAnthropic({
		system,
		messages,
		tools: [readPagesTool, speakTool],
		forcedToolName: speakTool.name,
		maxTokens: maxReplyTokens
	});
	return parseSpokenReply(toolUseNamed(secondResponse.content, speakTool.name)?.input);
}

function messagesFromTurns(turns: FaceChatTurn[]): AnthropicMessage[] {
	const firstUserIndex = turns.findIndex((turn) => turn.speaker === 'user');
	if (firstUserIndex < 0) return [];
	return turns.slice(firstUserIndex).map((turn) => ({
		role: turn.speaker === 'user' ? 'user' : 'assistant',
		content: turn.text
	}));
}
