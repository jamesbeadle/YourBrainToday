import type { MeteredCall } from './anthropicUsage';

/**
 * A source is read in four stages, one request each: the modeller updates the
 * expertise model, then the experience, process and human brains harvest what
 * applies to them. The row names the stage it is on; an empty stage means the
 * reading is over.
 */
export type ReadingStage = 'model' | 'experience' | 'process' | 'people';

export const readingStages: ReadingStage[] = ['model', 'experience', 'process', 'people'];

export const firstReadingStage: ReadingStage = 'model';

export const readingStageLabels: Record<ReadingStage, string> = {
	model: 'the modeller is studying it',
	experience: 'filing what happened',
	process: 'redrawing the process map',
	people: 'meeting the people in it'
};

export type ReadingProgress = {
	contextsCreated: number;
	pagesCreated: number;
	pagesUpdated: number;
	episodes: number;
	processTasks: number;
	people: number;
	connections: number;
	logLine: string;
	meteredCalls: MeteredCall[];
};

export const emptyReadingProgress: ReadingProgress = {
	contextsCreated: 0,
	pagesCreated: 0,
	pagesUpdated: 0,
	episodes: 0,
	processTasks: 0,
	people: 0,
	connections: 0,
	logLine: '',
	meteredCalls: []
};

// A stage that began longer ago than this has outlived any serverless
// function that could still be running it, so it may be taken up again.
export const stageStallMilliseconds = 8 * 60 * 1000;

export function isReadingStage(candidate: unknown): candidate is ReadingStage {
	return readingStages.some((stage) => stage === candidate);
}

export function stageAfter(stage: ReadingStage): ReadingStage | null {
	const index = readingStages.indexOf(stage);
	return readingStages[index + 1] ?? null;
}

export function isStageStalled(stageStartedAt: string | null, now = Date.now()): boolean {
	if (stageStartedAt === null) return true;
	return now - new Date(stageStartedAt).getTime() > stageStallMilliseconds;
}

export function parseReadingProgress(candidate: unknown): ReadingProgress {
	if (typeof candidate !== 'object' || candidate === null) return emptyReadingProgress;
	return { ...emptyReadingProgress, ...(candidate as Partial<ReadingProgress>) };
}
