import { isInterviewPhase, type InterviewPhase } from '$lib/data/knowledge/interviewPhases';
import type { KnowledgeKind } from '$lib/data/knowledge/knowledgeKinds';
import { HttpStatus } from '$lib/data/httpStatus';

export type InterviewKind = KnowledgeKind | null;

export type InterviewTurnResult =
	| { status: 'ok'; reply: string; phase: InterviewPhase | null }
	| { status: 'out_of_credits' }
	| { status: 'error' };

export const interviewOpeningLine = "Let's begin — ask me your first question.";

export const defaultInterviewIntro =
	'The interviewer reads what this knowledge base already holds, finds the biggest gap, ' +
	'and asks about exactly that. Every answer is filed into the right brains as you talk.';

export const kindInterviewIntros: Record<KnowledgeKind, string> = {
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
		'produces, what goes wrong at handovers. The interviewer reads the gaps in your process ' +
		'map and asks about the next one; the map redraws itself as you answer.',
	human:
		'A focused interview on the people around your business — who knows whom, who trusts ' +
		'whom, and who has fallen out. Everyone you name joins the network, with how well they ' +
		'get on, so you know who to go through.'
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
	if (response.status === HttpStatus.paymentRequired) return { status: 'out_of_credits' };
	if (!response.ok) return { status: 'error' };
	const payload = await response.json();
	return {
		status: 'ok',
		reply: typeof payload.reply === 'string' ? payload.reply : '',
		phase: isInterviewPhase(payload.phase) ? payload.phase : null
	};
}
