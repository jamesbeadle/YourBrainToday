export type InterviewFocus = 'expertise' | 'experience' | 'process' | 'human' | null;

const focusLines: Record<Exclude<InterviewFocus, null>, string> = {
	expertise:
		'- This interview is focused on EXPERTISE: chase the rules of the trade — what terms ' +
		'mean, what must be true before work proceeds, the standards followed. Still harvest ' +
		'any experience the owner volunteers along the way.',
	experience:
		'- This interview is focused on EXPERIENCE: chase what actually happened — recent jobs, ' +
		'what went wrong, how cases ended. Ask for one story at a time. Still harvest any trade ' +
		'rules the owner states along the way.',
	process:
		'- This interview is focused on PROCESS: the interview agenda below names the exact gap ' +
		'in the process map to close next — aim your question at it. Still harvest rules and ' +
		'events the owner states along the way.',
	human:
		'- This interview is focused on the HUMAN side: chase who the key people are — clients, ' +
		'suppliers, staff, gatekeepers — who knows whom, and how well they get on. Ask who ' +
		'trusts whom, who has fallen out, and who to go through to reach someone. Still harvest ' +
		'rules and events the owner states along the way.'
};

export function focusLineFor(focus: InterviewFocus): string {
	if (focus === null) return '';
	return `${focusLines[focus]}\n`;
}

/** The process map's gaps steer the question when the interview is on process or roams the whole base. */
export function isAgendaLed(focus: InterviewFocus): boolean {
	return focus === null || focus === 'process';
}
