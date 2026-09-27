import { error } from '@sveltejs/kit';
import type { InterviewTurnInput } from './interviewAgent';
import type { InterviewFocus } from './interviewPrompt';

export type InterviewRequest = {
	knowledgeBaseId: string;
	conversation: InterviewTurnInput[];
	focus: InterviewFocus;
};

const interviewFocuses: Exclude<InterviewFocus, null>[] = [
	'expertise',
	'experience',
	'process',
	'human'
];

const longestConversation = 16;
const longestTurnLength = 2000;

export async function readInterviewRequest(request: Request): Promise<InterviewRequest> {
	const payload = await request.json();
	const knowledgeBaseId = typeof payload.knowledgeBaseId === 'string' ? payload.knowledgeBaseId : '';
	if (knowledgeBaseId === '') error(400, 'A knowledge base is required');
	return {
		knowledgeBaseId,
		conversation: parseConversation(payload.conversation),
		focus: parseFocus(payload.focusKind)
	};
}

function parseFocus(value: unknown): InterviewFocus {
	return interviewFocuses.find((focus) => focus === value) ?? null;
}

function parseConversation(value: unknown): InterviewTurnInput[] {
	if (!Array.isArray(value)) return [];
	return value
		.flatMap((turn) => {
			if (typeof turn !== 'object' || turn === null) return [];
			const record = turn as Record<string, unknown>;
			const author = record.author === 'agent' ? 'agent' : 'user';
			const text = typeof record.text === 'string' ? record.text.slice(0, longestTurnLength) : '';
			return text === '' ? [] : [{ author, text } as InterviewTurnInput];
		})
		.slice(-longestConversation);
}
