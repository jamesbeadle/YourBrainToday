import { answerTool, readPagesTool } from '../brain/modellerAnswerTools';
import { hiveMindQueryPrompt } from './hiveMindQueryPrompt';
import { pagesReadByMember, readHivePages } from './readHivePagesExchange';
import { parseBrainAnswer } from '../brain/parseBrainAnswer';
import { renderHiveMindIndex, type HiveSpecialistModel } from './getHiveModelIndex';
import { requestAnthropic } from '$lib/server/anthropic/requestAnthropic';
import { toolUseNamed, toolUsesNamed } from '../brain/readPagesExchange';
import type { AnthropicMessage } from '$lib/server/anthropic/anthropicTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

const maxAnswerTokens = 4000;

export type HiveConsultation = {
	answerMarkdown: string;
	citedPageKeys: string[];
	pagesReadCounts: Map<string, number>;
};

export async function askHiveMind(
	supabase: SupabaseClient,
	specialists: HiveSpecialistModel[],
	question: string
): Promise<HiveConsultation> {
	const system = `${hiveMindQueryPrompt}\n\n## The hive\n\n${renderHiveMindIndex(specialists)}`;
	const messages: AnthropicMessage[] = [{ role: 'user', content: question }];
	const firstResponse = await requestAnthropic({
		system,
		messages,
		tools: [readPagesTool, answerTool],
		maxTokens: maxAnswerTokens
	});
	const hasImmediateAnswer = toolUseNamed(firstResponse.content, answerTool.name) !== undefined;
	const readRequests = hasImmediateAnswer
		? []
		: toolUsesNamed(firstResponse.content, readPagesTool.name);
	if (readRequests.length === 0) {
		return consultationFrom(firstResponse.content, new Map());
	}
	const exchange = await readHivePages(supabase, readRequests);
	messages.push({ role: 'assistant', content: firstResponse.content });
	messages.push(exchange.resultMessage);
	const secondResponse = await requestAnthropic({
		system,
		messages,
		tools: [readPagesTool, answerTool],
		forcedToolName: answerTool.name,
		maxTokens: maxAnswerTokens
	});
	return consultationFrom(secondResponse.content, pagesReadByMember(exchange.pages));
}

function consultationFrom(
	content: unknown[],
	pagesReadCounts: Map<string, number>
): HiveConsultation {
	const answer = parseBrainAnswer(toolUseNamed(content, answerTool.name)?.input);
	return {
		answerMarkdown: answer.answerMarkdown,
		citedPageKeys: answer.citedSlugs,
		pagesReadCounts
	};
}
