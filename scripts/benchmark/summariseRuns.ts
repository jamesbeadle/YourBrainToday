import type { ArmName, BenchmarkRun } from './benchmarkTypes';

export type ArmSummary = {
	arm: ArmName;
	runCount: number;
	fallbackCount: number;
	meanCorrectness: number;
	meanCompleteness: number;
	meanGroundedness: number;
	meanTotal: number;
	meanInputTokens: number;
	meanOutputTokens: number;
	meanContextCharacters: number;
	meanLatencySeconds: number;
	meanPagesRead: number;
};

const millisecondsPerSecond = 1000;

export function summariseRuns(runs: BenchmarkRun[], arms: ArmName[]): ArmSummary[] {
	return arms.map((arm) => summariseArm(arm, runs.filter((run) => run.arm === arm)));
}

function summariseArm(arm: ArmName, runs: BenchmarkRun[]): ArmSummary {
	const mean = (pick: (run: BenchmarkRun) => number) =>
		runs.length === 0 ? 0 : runs.reduce((sum, run) => sum + pick(run), 0) / runs.length;
	return {
		arm,
		runCount: runs.length,
		fallbackCount: runs.filter((run) => run.isFallback).length,
		meanCorrectness: mean((run) => run.judgement.correctness),
		meanCompleteness: mean((run) => run.judgement.completeness),
		meanGroundedness: mean((run) => run.judgement.groundedness),
		meanTotal: mean(totalScore),
		meanInputTokens: mean((run) => run.usage.inputTokens + run.usage.cacheReadTokens + run.usage.cacheWriteTokens),
		meanOutputTokens: mean((run) => run.usage.outputTokens),
		meanContextCharacters: mean((run) => run.answer.contextCharacters),
		meanLatencySeconds: mean((run) => run.latencyMilliseconds / millisecondsPerSecond),
		meanPagesRead: mean((run) => run.answer.pagesRead.length)
	};
}

export function totalScore(run: BenchmarkRun): number {
	return run.judgement.correctness + run.judgement.completeness + run.judgement.groundedness;
}
