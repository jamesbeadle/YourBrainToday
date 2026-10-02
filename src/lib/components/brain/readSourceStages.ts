import { readingStageLabels } from '$lib/data/sourceReading';
import type { BrainSource } from '$lib/data/brainTypes';

export type ReadingOutcome =
	| { status: 'ingested'; creditBalance: number | null }
	| { status: 'proposed' }
	| { status: 'out_of_credits' }
	| { status: 'failed'; message: string };

type StageReply = BrainSource & {
	step: { status: string; stage?: string; failure?: string; creditBalance?: number | null };
};

const mostStageRequests = 8;

/**
 * Drives a source through its reading one stage per request, telling the
 * caller which stage is running, until the server says it is in the brain,
 * proposed for review or failed.
 */
export async function readSourceStages(
	sourceId: string,
	onProgress: (stage: string) => void = () => {}
): Promise<ReadingOutcome> {
	onProgress(readingStageLabels.model);
	for (let request = 0; request < mostStageRequests; request += 1) {
		const response = await fetch(`/api/brain/sources/${sourceId}/read`, { method: 'POST' });
		if (response.status === 402) return { status: 'out_of_credits' };
		if (!response.ok) return { status: 'failed', message: await messageFrom(response) };
		const reply: StageReply = await response.json();
		const outcome = outcomeOf(reply);
		if (outcome !== null) return outcome;
		onProgress(reply.stage === null ? 'finishing' : readingStageLabels[reply.stage]);
	}
	return { status: 'failed', message: 'The reading is taking longer than expected — it carries on in the background.' };
}

function outcomeOf(reply: StageReply): ReadingOutcome | null {
	if (reply.step.status === 'ingested') {
		return { status: 'ingested', creditBalance: reply.step.creditBalance ?? null };
	}
	if (reply.step.status === 'proposed') return { status: 'proposed' };
	if (reply.step.status === 'failed') {
		return { status: 'failed', message: reply.step.failure ?? 'Reading that document failed.' };
	}
	if (reply.step.status === 'busy') {
		return { status: 'failed', message: 'That document is being read in another window.' };
	}
	return null;
}

async function messageFrom(response: Response): Promise<string> {
	const fallbackMessage = 'Something went wrong — please try again.';
	const payload = await response.json().catch(() => null);
	if (payload === null || typeof payload.message !== 'string') return fallbackMessage;
	return payload.message;
}
