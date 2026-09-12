const ingestStages = [
	{ fromSeconds: 120, message: 'still working — thorough reads take a few minutes' },
	{ fromSeconds: 60, message: 'distilling concepts into the model' },
	{ fromSeconds: 20, message: 'the modeller is studying it' },
	{ fromSeconds: 0, message: 'reading the source' }
];

export function ingestStageAt(elapsedSeconds: number): string {
	const stage = ingestStages.find((candidate) => elapsedSeconds >= candidate.fromSeconds);
	return stage?.message ?? 'reading the source';
}

export function formatElapsedSeconds(elapsedSeconds: number): string {
	const minutes = Math.floor(elapsedSeconds / 60);
	const seconds = elapsedSeconds % 60;
	if (minutes === 0) return `${seconds}s`;
	return `${minutes}m ${seconds}s`;
}
