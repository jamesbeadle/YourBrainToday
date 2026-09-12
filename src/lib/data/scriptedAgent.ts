export const openingQuestion = 'Tell us about your business today?';

const followUpQuestions = [
	'Interesting — who does what? Talk me through the roles in your team, even the unofficial ones.',
	'Let’s pick one of those roles. What does a typical day look like, task by task?',
	'When a task finishes, where does its output go next — a person, a system, a spreadsheet?',
	'Which of those handovers most often goes wrong or gets delayed?',
	'What needs to be in place before that task can even start?',
	'If you hired someone tomorrow, which part of this would be hardest to explain to them?'
];

const closingMessage =
	'Brilliant. I have enough to start sketching your Process Map — every role a line, every task a ' +
	'station, every handover an interchange. Take a look at the demo map to see where this is heading.';

export const agentReplyDelayMilliseconds = 1400;

export function agentReplyForTurn(userTurnCount: number): string {
	const questionIndex = userTurnCount - 1;
	if (questionIndex < followUpQuestions.length) return followUpQuestions[questionIndex];
	return closingMessage;
}
