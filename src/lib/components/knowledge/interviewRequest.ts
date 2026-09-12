export type InterviewKind = 'expertise' | 'experience' | 'process' | null;

export type InterviewTurnResult =
	| { status: 'ok'; reply: string }
	| { status: 'out_of_credits' }
	| { status: 'error' };

export const interviewOpeningLine = "Let's begin — ask me your first question.";

export const defaultInterviewIntro =
	'The interviewer reads what this knowledge base already holds, finds the biggest gap, ' +
	'and asks about exactly that. Every answer is filed into the right brains as you talk.';

export const kindInterviewIntros: Record<'expertise' | 'experience' | 'process', string> = {
	expertise:
		'A focused interview on the rules of your trade — what terms mean, what standards apply, ' +
		'what must be true before work proceeds. Everything you say is filed into the right ' +
		'brains as you talk.',
	experience:
		'A focused interview on what actually happened — jobs, incidents, decisions. Events land ' +
		'here in their case files, and any trade rules you state along the way are filed to your ' +
		'expertise brain.',
	process:
		'A focused interview on how work moves — who does what, what each task consumes and ' +
		'produces, what goes wrong at handovers. The map redraws itself as you answer.'
};

export async function fetchInterviewReply(
	knowledgeBaseId: string,
	focusKind: InterviewKind,
	conversation: { author: string; text: string }[]
): Promise<InterviewTurnResult> {
	const response = await fetch('/api/knowledge-base/interview', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ knowledgeBaseId, conversation, focusKind })
	});
	if (response.status === 402) return { status: 'out_of_credits' };
	if (!response.ok) return { status: 'error' };
	const payload = await response.json();
	return { status: 'ok', reply: typeof payload.reply === 'string' ? payload.reply : '' };
}
