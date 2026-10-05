import { describe, expect, it } from 'vitest';
import { sourceDetailLine, unreadSourceHint } from './sourceDetailLine';
import { emptyReadingProgress } from '$lib/data/sourceReading';
import type { BrainSource } from '$lib/data/brainTypes';

const source: BrainSource = {
	id: 'source-1',
	filename: 'handbook.pdf',
	mimeType: 'application/pdf',
	byteCount: 1024,
	status: 'ingested',
	summary: 'The staff handbook.',
	arrivedThrough: 'upload',
	createdAt: '2026-10-05T09:00:00Z',
	stage: null,
	stageStartedAt: null,
	failure: '',
	progress: emptyReadingProgress
};

describe('sourceDetailLine', () => {
	it('describes a document in the brain by its summary', () => {
		expect(sourceDetailLine(source)).toBe('The staff handbook.');
	});

	it('tells the person an unread document is waiting on Read it', () => {
		expect(sourceDetailLine({ ...source, status: 'uploaded', summary: '' })).toBe(
			unreadSourceHint
		);
	});

	it('describes a failed reading by its failure', () => {
		const failed: BrainSource = { ...source, status: 'failed', failure: 'The file was empty.' };
		expect(sourceDetailLine(failed)).toBe('The file was empty.');
	});
});
