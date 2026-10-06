import type { ReadingProgress, ReadingStage } from './sourceReading';

export type BrainSourceStatus =
	| 'uploaded'
	| 'reading'
	| 'ingested'
	| 'failed'
	| 'proposed'
	| 'rejected';

export type BrainSourceArrival = 'upload' | 'mcp' | 'api';

export type BrainSource = {
	id: string;
	filename: string;
	mimeType: string;
	byteCount: number;
	status: BrainSourceStatus;
	summary: string;
	arrivedThrough: BrainSourceArrival;
	createdAt: string;
	stage: ReadingStage | null;
	stageStartedAt: string | null;
	failure: string;
	progress: ReadingProgress;
};
