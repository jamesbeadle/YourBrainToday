import { env } from '$env/dynamic/private';
import { anthropicMessagesUrl, anthropicVersion } from './anthropicConstants';
import { isRetryableFailure, isRetryableStatus, pauseBefore, planAttempt, wait } from './anthropicRetry';
import { recordMeteredCall } from './modelContext';
import { shapeRequestForModel } from './modelRequestShape';
import { resolveRequestModel } from './resolveRequestModel';
import type { AnthropicMessage, AnthropicRequestTool, AnthropicResponse } from './anthropicTypes';
import type { AnthropicUsage } from '$lib/data/anthropicUsage';

const failureDetailLimit = 300;

export type AnthropicRequest = {
	system: string;
	messages: AnthropicMessage[];
	tools: AnthropicRequestTool[];
	maxTokens: number;
	forcedToolName?: string;
	// Makes the model reply through one of the tools rather than in prose.
	mustUseTool?: boolean;
	// Pins the model for callers that answer on someone else's behalf (a
	// chatbot member's question runs on the bot's model, not the caller's).
	model?: string;
};

class AnthropicStatusFailure extends Error {
	constructor(
		readonly status: number,
		detail: string
	) {
		super(`Anthropic request failed with status ${status}: ${detail}`);
	}
}

export async function requestAnthropic(request: AnthropicRequest): Promise<AnthropicResponse> {
	if ((env.ANTHROPIC_API_KEY ?? '') === '') {
		throw new Error('ANTHROPIC_API_KEY is not set — add it to .env');
	}
	const model = request.model ?? (await resolveRequestModel());
	const body = JSON.stringify({
		model,
		...shapeRequestForModel(model, request),
		tools: request.tools,
		messages: request.messages
	});
	const answer = await sendWithRetries(body);
	recordMeteredCall({ modelId: model, usage: usageFrom(answer) });
	return answer;
}

async function sendWithRetries(body: string): Promise<AnthropicResponse> {
	const startedAt = Date.now();
	for (let attemptIndex = 0; ; attemptIndex += 1) {
		const plan = planAttempt(startedAt, attemptIndex);
		if (plan === null) throw new Error('Anthropic kept failing and the time for retries ran out');
		await wait(pauseBefore(attemptIndex));
		try {
			return await sendOnce(body, plan.timeoutMilliseconds);
		} catch (failure) {
			if (!canRetry(failure) || planAttempt(startedAt, attemptIndex + 1) === null) throw failure;
			console.warn('Anthropic request will be retried', attemptIndex + 1, describe(failure));
		}
	}
}

async function sendOnce(body: string, timeoutMilliseconds: number): Promise<AnthropicResponse> {
	const response = await fetch(anthropicMessagesUrl, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			'x-api-key': env.ANTHROPIC_API_KEY ?? '',
			'anthropic-version': anthropicVersion
		},
		body,
		signal: AbortSignal.timeout(timeoutMilliseconds)
	});
	if (!response.ok) {
		const detail = (await response.text()).slice(0, failureDetailLimit);
		throw new AnthropicStatusFailure(response.status, detail);
	}
	return response.json();
}

function canRetry(failure: unknown): boolean {
	if (failure instanceof AnthropicStatusFailure) return isRetryableStatus(failure.status);
	return isRetryableFailure(failure);
}

function describe(failure: unknown): string {
	return failure instanceof Error ? failure.message : String(failure);
}

function usageFrom(answer: AnthropicResponse): AnthropicUsage {
	return {
		inputTokens: answer.usage?.input_tokens ?? 0,
		outputTokens: answer.usage?.output_tokens ?? 0,
		cacheReadTokens: answer.usage?.cache_read_input_tokens ?? 0,
		cacheWriteTokens: answer.usage?.cache_creation_input_tokens ?? 0
	};
}
