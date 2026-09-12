import { experienceEventSchema } from '$lib/server/agent/workspaceUpdateTool';
import { parseHarvest, type HarvestedKnowledge } from '$lib/server/agent/parseHarvest';
import { requestAnthropic } from '$lib/server/anthropic/requestAnthropic';
import { toolUseFrom } from '$lib/server/anthropic/anthropicTypes';
import { interviewSystemPrompt, type InterviewFocus } from './interviewPrompt';
import type { InterviewContext } from './interviewContext';

export type InterviewTurnInput = { author: 'agent' | 'user'; text: string };

export type InterviewTurn = { reply: string; harvest: HarvestedKnowledge };

const maxReplyTokens = 1500;

const interviewUpdateTool = {
	name: 'interview_update',
	description:
		'Return your next interview question together with any expertise and experience ' +
		'harvested from the owner’s latest answer.',
	input_schema: {
		type: 'object',
		required: ['reply'],
		properties: {
			reply: {
				type: 'string',
				description: 'ONE pertinent question, under 80 words, in the owner’s vocabulary.'
			},
			expertiseFacts: {
				type: 'array',
				items: { type: 'string' },
				description: 'Durable trade rules NEWLY stated in the latest answer. Usually empty.'
			},
			experienceEvents: {
				type: 'array',
				items: experienceEventSchema,
				description: 'Things that happened, NEWLY stated in the latest answer. Usually empty.'
			}
		}
	}
};

export async function askInterviewer(
	conversation: InterviewTurnInput[],
	context: InterviewContext,
	focus: InterviewFocus = null
): Promise<InterviewTurn> {
	const response = await requestAnthropic({
		system: interviewSystemPrompt(context, focus),
		messages: conversation.map((turn) => ({
			role: turn.author === 'agent' ? ('assistant' as const) : ('user' as const),
			content: turn.text
		})),
		tools: [interviewUpdateTool],
		forcedToolName: interviewUpdateTool.name,
		maxTokens: maxReplyTokens
	});
	const update = toolUseFrom(response, interviewUpdateTool.name);
	if (update === undefined) throw new Error('Interviewer response contained no update');
	const payload = update as { reply?: unknown };
	return {
		reply: typeof payload.reply === 'string' ? payload.reply : 'Tell me more about that.',
		harvest: parseHarvest(update as Record<string, unknown>)
	};
}
