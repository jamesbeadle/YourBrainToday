import { readingStageLabels, type ReadingProgress } from '$lib/data/sourceReading';
import type { BrainSource } from '$lib/data/brainTypes';

export type ReadingOutcome =
	| {
			status: 'ingested';
			creditBalance: number | null;
			progress: ReadingProgress;
	  }
	| { status: 'proposed' }
	| { status: 'out_of_credits' }
	| { status: 'failed'; message: string };

/** What the read endpoint says back: where the reading stands, and the step just taken. */
export type StageReply = BrainSource & {
	step: {
		status: string;
		stage?: string;
		failure?: string;
		creditBalance?: number | null;
	};
};

export function isStageBusy(reply: StageReply): boolean {
	return reply.step.status === 'busy';
}

export function stageLabelOf(reply: StageReply): string {
	return reply.stage === null ? 'finishing' : readingStageLabels[reply.stage];
}

/** The reading's end, or null while it is still going. */
export function outcomeOf(reply: StageReply): ReadingOutcome | null {
	if (reply.step.status === 'ingested') {
		return {
			status: 'ingested',
			creditBalance: reply.step.creditBalance ?? null,
			progress: reply.progress
		};
	}
	if (reply.step.status === 'proposed') return { status: 'proposed' };
	if (reply.step.status === 'failed') {
		return {
			status: 'failed',
			message: reply.step.failure ?? 'Reading that document failed.'
		};
	}
	return null;
}
