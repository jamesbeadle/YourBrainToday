import type { InterviewPhase } from '$lib/server/agent/interview/gapTypes';

export type { InterviewPhase };

export const interviewPhases: InterviewPhase[] = [
	'foundation',
	'roles',
	'flow',
	'connection',
	'interchanges',
	'resolution',
	'complete'
];

export const interviewPhaseDescriptions: Record<InterviewPhase, string> = {
	foundation: 'Naming the business, what arrives from outside, and the first roles.',
	roles: 'Filling out what each role handles in a normal week.',
	flow: 'Pinning down what every task takes in and puts out.',
	connection: 'Joining outputs to the tasks that pick them up.',
	interchanges: 'Learning what goes wrong where work changes hands.',
	resolution: 'Checking the facts the interviewer inferred.',
	complete: 'Every part of the map holds — correct anything that looks wrong, or go deeper.'
};

export const completePhase: InterviewPhase = 'complete';

export function isInterviewPhase(candidate: unknown): candidate is InterviewPhase {
	return interviewPhases.some((phase) => phase === candidate);
}

export function phaseStepOf(phase: InterviewPhase): number {
	return interviewPhases.indexOf(phase) + 1;
}

export const lastPhaseStep = interviewPhases.length;
