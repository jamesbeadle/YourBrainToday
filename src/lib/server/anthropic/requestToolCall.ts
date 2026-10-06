import { requestAnthropic, type AnthropicRequest } from './requestAnthropic';
import { StopReason, textFrom, toolUseFrom, type AnthropicResponse } from './anthropicTypes';

const nudgeAttempts = 1;

/**
 * A request whose reply must be one named tool call. Models that refuse a
 * forced tool choice are only asked for one, and now and then answer in
 * prose instead; that prose is shown back to them once with the ask
 * repeated, which is far cheaper than failing the whole job.
 */
export async function requestToolCall(request: AnthropicRequest, toolName: string): Promise<unknown> {
	const demanded = { ...request, forcedToolName: toolName };
	let response = await requestAnthropic(demanded);
	for (let attempt = 0; attempt < nudgeAttempts && isProseOnly(response, toolName); attempt += 1) {
		response = await requestAnthropic({ ...demanded, messages: nudged(demanded, response, toolName) });
	}
	if (response.stop_reason === StopReason.maxTokens) {
		throw new Error('The reply ran out of room before the tool call was complete');
	}
	const call = toolUseFrom(response, toolName);
	if (call === undefined) throw new Error(`The reply held no ${toolName} call`);
	return call;
}

function isProseOnly(response: AnthropicResponse, toolName: string): boolean {
	return toolUseFrom(response, toolName) === undefined && textFrom(response) !== '';
}

function nudged(request: AnthropicRequest, response: AnthropicResponse, toolName: string) {
	return [
		...request.messages,
		{ role: 'assistant' as const, content: response.content },
		{
			role: 'user' as const,
			content: `That was prose. Reply again, this time only by calling the ${toolName} tool with the complete result.`
		}
	];
}
