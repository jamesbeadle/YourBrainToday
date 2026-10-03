import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { summariseRuns, totalScore, type ArmSummary } from './summariseRuns';
import type { Arm, BenchmarkRun, BenchmarkSettings } from './benchmarkTypes';

export type ReportFiles = { markdownPath: string; jsonPath: string; summaryMarkdown: string };

const resultsDirectory = path.resolve(path.dirname(new URL(import.meta.url).pathname), 'results');
const scoreDecimals = 2;
const longestReason = 160;

export function writeReport(settings: BenchmarkSettings, arms: Arm[], runs: BenchmarkRun[]): ReportFiles {
	mkdirSync(resultsDirectory, { recursive: true });
	const stamp = new Date().toISOString().replace(/[:.]/g, '-');
	const summaries = summariseRuns(runs, settings.arms);
	const summaryMarkdown = renderSummaryTable(summaries);
	const markdown = [
		`# Benchmark — ${stamp}`,
		'',
		renderSettings(settings, arms),
		'',
		'## Summary per arm (means over every question × repeat; scores 0–2)',
		'',
		summaryMarkdown,
		'',
		'## Every run',
		'',
		renderRunsTable(runs)
	].join('\n');
	const markdownPath = path.join(resultsDirectory, `${stamp}.md`);
	const jsonPath = path.join(resultsDirectory, `${stamp}.json`);
	writeFileSync(markdownPath, markdown);
	writeFileSync(jsonPath, JSON.stringify({ settings, setupNotes: arms.map(noteOf), summaries, runs }, null, 2));
	return { markdownPath, jsonPath, summaryMarkdown };
}

function renderSettings(settings: BenchmarkSettings, arms: Arm[]): string {
	return [
		`- Knowledge base: ${settings.knowledgeBaseId}`,
		`- Model: ${settings.model}; judge: ${settings.judgeModel}; repeats: ${settings.repeats}`,
		`- Questions: ${settings.questionsPath}`,
		...arms.map((arm) => `- ${arm.name}: ${arm.setupNote}`)
	].join('\n');
}

function renderSummaryTable(summaries: ArmSummary[]): string {
	const header =
		'| Arm | Runs | Fallbacks | Correct | Complete | Grounded | Total /6 | Input tokens | Output tokens | Context chars | Latency s | Pages read |\n' +
		'| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |';
	const rows = summaries.map((summary) =>
		[
			summary.arm,
			summary.runCount,
			summary.fallbackCount,
			score(summary.meanCorrectness),
			score(summary.meanCompleteness),
			score(summary.meanGroundedness),
			score(summary.meanTotal),
			whole(summary.meanInputTokens),
			whole(summary.meanOutputTokens),
			whole(summary.meanContextCharacters),
			score(summary.meanLatencySeconds),
			score(summary.meanPagesRead)
		].join(' | ')
	);
	return [header, ...rows.map((row) => `| ${row} |`)].join('\n');
}

function renderRunsTable(runs: BenchmarkRun[]): string {
	const header =
		'| Question | Brain | Arm | Repeat | Correct | Complete | Grounded | Total | Input | Output | Latency s | Pages read | Reason |\n' +
		'| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |';
	const rows = runs.map((run) =>
		[
			run.questionId,
			run.brain,
			run.arm,
			run.repeat,
			run.judgement.correctness,
			run.judgement.completeness,
			run.judgement.groundedness,
			totalScore(run),
			run.usage.inputTokens + run.usage.cacheReadTokens + run.usage.cacheWriteTokens,
			run.usage.outputTokens,
			score(run.latencyMilliseconds / 1000),
			run.answer.pagesRead.length,
			run.judgement.reason.replace(/\|/g, '/').slice(0, longestReason)
		].join(' | ')
	);
	return [header, ...rows.map((row) => `| ${row} |`)].join('\n');
}

const score = (value: number) => value.toFixed(scoreDecimals);
const whole = (value: number) => Math.round(value).toLocaleString('en-GB');
const noteOf = (arm: Arm) => ({ arm: arm.name, note: arm.setupNote });
