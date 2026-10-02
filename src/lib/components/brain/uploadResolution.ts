import { readingSuccessLine } from './readingProgressSummary';
import type { UploadOutcome } from './uploadSourceFile';

export type UploadResolution = { status: 'done' | 'failed'; message: string };

export const sentForReviewMessage = 'Sent to the owner for review.';

export const outOfCreditsMessage = 'You are out of credits.';

/** How an upload's outcome reads once it is over. */
export function resolveUpload(outcome: UploadOutcome): UploadResolution {
	if (outcome.status === 'ingested') {
		return { status: 'done', message: readingSuccessLine(outcome.progress) };
	}
	if (outcome.status === 'proposed') return { status: 'done', message: sentForReviewMessage };
	if (outcome.status === 'out_of_credits')
		return { status: 'failed', message: outOfCreditsMessage };
	return { status: 'failed', message: outcome.message };
}
