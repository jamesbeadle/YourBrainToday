import type { ReadingProgress } from '$lib/data/sourceReading';

export type ProgressCount = { one: string; many: string; count: number };

export function progressCounts(progress: ReadingProgress): ProgressCount[] {
	return [
		{ one: 'context', many: 'contexts', count: progress.contextsCreated },
		{
			one: 'page created',
			many: 'pages created',
			count: progress.pagesCreated
		},
		{
			one: 'page updated',
			many: 'pages updated',
			count: progress.pagesUpdated
		},
		{ one: 'episode', many: 'episodes', count: progress.episodes },
		{
			one: 'process task',
			many: 'process tasks',
			count: progress.processTasks
		},
		{ one: 'person', many: 'people', count: progress.people },
		{ one: 'connection', many: 'connections', count: progress.connections }
	];
}

export function describeCount({ one, many, count }: ProgressCount): string {
	return `${count} ${count === 1 ? one : many}`;
}

export function readingSuccessLine(progress: ReadingProgress): string {
	const added = progressCounts(progress)
		.filter((entry) => entry.count > 0)
		.map(describeCount);
	if (added.length === 0) return 'In the brain — nothing new to add.';
	return `In the brain — ${added.join(', ')}.`;
}
