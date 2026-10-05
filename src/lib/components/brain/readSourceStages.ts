import { connectionLostMessage } from './connectionGuard';
import { drivenSources } from './drivenSources.svelte';
import { isStageBusy, outcomeOf, stageLabelOf, type ReadingOutcome, type StageReply } from './stageReply';
import { messageFrom } from '$lib/client/responseMessage';
import { readingStageLabels } from '$lib/data/sourceReading';

export type { ReadingOutcome } from './stageReply';

const mostStageRequests = 8;

export const busyRetryMilliseconds = 5000;

export const mostBusyWaits = 120;

export const waitingForStageLine = 'waiting for the stage already running to finish';

const tooLongMessage =
	'The reading is taking longer than expected — it carries on in the background.';

/**
 * Drives a source through its reading one stage per request, telling the
 * caller which stage is running, until the server says it is in the brain,
 * proposed for review or failed. A stage another function is still running
 * is waited for, then the reading carries on from the next. A dropped
 * connection ends in a failure too.
 */
export async function readSourceStages(
	sourceId: string,
	onProgress: (stage: string) => void = () => {}
): Promise<ReadingOutcome> {
	drivenSources.add(sourceId);
	try {
		return await requestStages(sourceId, onProgress);
	} catch {
		return { status: 'failed', message: connectionLostMessage };
	} finally {
		drivenSources.delete(sourceId);
	}
}

async function requestStages(
	sourceId: string,
	onProgress: (stage: string) => void
): Promise<ReadingOutcome> {
	onProgress(readingStageLabels.model);
	let stageRequests = 0;
	let busyWaits = 0;
	while (stageRequests < mostStageRequests && busyWaits < mostBusyWaits) {
		const reply = await requestStage(sourceId);
		if ('status' in reply) return reply;
		const outcome = outcomeOf(reply.stageReply);
		if (outcome !== null) return outcome;
		if (isStageBusy(reply.stageReply)) {
			busyWaits += 1;
			onProgress(waitingForStageLine);
			await pause(busyRetryMilliseconds);
			continue;
		}
		stageRequests += 1;
		onProgress(stageLabelOf(reply.stageReply));
	}
	return { status: 'failed', message: tooLongMessage };
}

async function requestStage(
	sourceId: string
): Promise<{ stageReply: StageReply } | ReadingOutcome> {
	const response = await fetch(`/api/brain/sources/${sourceId}/read`, { method: 'POST' });
	if (response.status === 402) return { status: 'out_of_credits' };
	if (!response.ok) return { status: 'failed', message: await messageFrom(response) };
	return { stageReply: await response.json() };
}

function pause(milliseconds: number): Promise<void> {
	return new Promise((resume) => setTimeout(resume, milliseconds));
}
