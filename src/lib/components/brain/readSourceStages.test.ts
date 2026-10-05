import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	busyRetryMilliseconds,
	readSourceStages,
	waitingForStageLine
} from './readSourceStages';
import { drivenSources } from './drivenSources.svelte';
import { emptyReadingProgress } from '$lib/data/sourceReading';

const reply = (step: Record<string, unknown>, stage: string | null = 'experience') =>
	new Response(JSON.stringify({ stage, progress: emptyReadingProgress, step }));

describe('readSourceStages', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	it('waits for a stage another function is running, then carries on', async () => {
		const fetchStub = vi
			.fn()
			.mockResolvedValueOnce(reply({ status: 'busy' }))
			.mockResolvedValueOnce(reply({ status: 'busy' }))
			.mockResolvedValueOnce(reply({ status: 'reading', stage: 'process' }, 'process'))
			.mockResolvedValueOnce(reply({ status: 'ingested', creditBalance: 7 }, null));
		vi.stubGlobal('fetch', fetchStub);
		const stages: string[] = [];
		const reading = readSourceStages('source-1', (stage) => stages.push(stage));
		await vi.advanceTimersByTimeAsync(busyRetryMilliseconds * 2);
		const outcome = await reading;
		expect(outcome.status).toBe('ingested');
		expect(fetchStub).toHaveBeenCalledTimes(4);
		expect(stages).toContain(waitingForStageLine);
		expect(drivenSources.has('source-1')).toBe(false);
	});

	it('reports the failure the server names', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(reply({ status: 'failed', failure: 'The file was empty.' })));
		const outcome = await readSourceStages('source-2');
		expect(outcome).toEqual({ status: 'failed', message: 'The file was empty.' });
	});
});
