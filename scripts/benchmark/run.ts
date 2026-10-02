import { brainsArm } from './arms/brainsArm';
import { brainsSelfArm } from './arms/brainsSelfArm';
import { documentsArm } from './arms/documentsArm';
import { helpText, parseBenchmarkArguments } from './benchmarkArguments';
import { isFallbackAnswer } from './benchmarkAnswerTool';
import { judgeAnswer } from './judgeAnswer';
import { readQuestions } from './readQuestions';
import { runMetered } from './meteredRun';
import { writeReport } from './writeReport';
import { getKnowledgeBase } from '$lib/server/knowledge/getKnowledgeBase';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { Arm, BenchmarkQuestion, BenchmarkRun, BenchmarkSettings } from './benchmarkTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

const requiredEnvironment = ['ANTHROPIC_API_KEY', 'SUPABASE_SECRET_KEY', 'PUBLIC_SUPABASE_URL'];

export async function runBenchmark(argumentList: string[]): Promise<void> {
	const settings = parseBenchmarkArguments(argumentList);
	if (settings === 'help') {
		console.log(helpText);
		return;
	}
	requireEnvironment();
	const questions = readQuestions(settings.questionsPath);
	const supabase = supabaseServiceClient();
	const arms = await prepareArms(supabase, settings);
	const runs: BenchmarkRun[] = [];
	for (const question of questions) {
		for (const arm of arms) {
			for (let repeat = 1; repeat <= settings.repeats; repeat += 1) {
				runs.push(await runOnce(settings, question, arm, repeat));
			}
		}
	}
	const report = writeReport(settings, arms, runs);
	console.log(`\n${report.summaryMarkdown}\n\nReport: ${report.markdownPath}\nRaw: ${report.jsonPath}`);
}

function requireEnvironment(): void {
	const missing = requiredEnvironment.filter((name) => (process.env[name] ?? '') === '');
	if (missing.length === 0) return;
	throw new Error(`Missing in .env or the environment: ${missing.join(', ')}. The benchmark cannot run without them.`);
}

async function prepareArms(supabase: SupabaseClient, settings: BenchmarkSettings): Promise<Arm[]> {
	const knowledgeBase = await getKnowledgeBase(supabase, settings.knowledgeBaseId);
	if (knowledgeBase === null) throw new Error(`No knowledge base has the id ${settings.knowledgeBaseId}`);
	const arms: Arm[] = [];
	for (const name of settings.arms) {
		if (name === 'documents') {
			arms.push(await documentsArm(supabase, knowledgeBase.id, settings.model, settings.documentBudgetCharacters));
		}
		if (name === 'brains') arms.push(await brainsArm(supabase, knowledgeBase, settings.model));
		if (name === 'brains-self') arms.push(await brainsSelfArm(supabase, knowledgeBase, settings.model));
	}
	arms.forEach((arm) => console.log(`[${arm.name}] ${arm.setupNote}`));
	return arms;
}

async function runOnce(
	settings: BenchmarkSettings,
	question: BenchmarkQuestion,
	arm: Arm,
	repeat: number
): Promise<BenchmarkRun> {
	console.log(`[${arm.name}] ${question.id} (repeat ${repeat})…`);
	const metered = await runMetered(settings.model, () => arm.answer(question.question));
	const judgement = await judgeAnswer(settings.judgeModel, question, metered.value.answerMarkdown);
	return {
		questionId: question.id,
		brain: question.brain,
		arm: arm.name,
		repeat,
		answer: metered.value,
		isFallback: isFallbackAnswer(metered.value.answerMarkdown),
		usage: metered.usage,
		callCount: metered.callCount,
		latencyMilliseconds: metered.latencyMilliseconds,
		judgement
	};
}
