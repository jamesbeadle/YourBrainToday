import { isFallbackAnswer } from './benchmarkAnswerTool';
import { requestToolCall } from '$lib/server/anthropic/requestToolCall';
import type { AnthropicTool } from '$lib/server/anthropic/anthropicTypes';
import type { BenchmarkQuestion, Judgement } from './benchmarkTypes';

const lowestScore = 0;
const highestScore = 2;
const maxJudgementTokens = 1000;

const scoreField = (description: string) => ({
	type: 'integer',
	minimum: lowestScore,
	maximum: highestScore,
	description
});

const scoreAnswerTool: AnthropicTool = {
	name: 'score_answer',
	description: 'Score one answer against the gold answer.',
	input_schema: {
		type: 'object',
		required: ['correctness', 'completeness', 'groundedness', 'reason'],
		properties: {
			correctness: scoreField('0 wrong or missing, 1 partly right, 2 right on every point the gold answer makes'),
			completeness: scoreField('0 covers little of the gold answer, 1 covers some, 2 covers all of it'),
			groundedness: scoreField(
				'2 asserts nothing beyond the gold answer and notes, 1 adds a little that is not there, 0 asserts things the gold answer and notes contradict or do not support'
			),
			reason: { type: 'string', description: 'One line on why, naming what was right, missing or invented' }
		}
	}
};

const judgePrompt =
	'You are a strict examiner. Score the candidate answer against the gold answer and the notes, ' +
	'which are the only ground truth. Reply only through the score_answer tool.';

export const fallbackJudgement: Judgement = {
	correctness: lowestScore,
	completeness: lowestScore,
	groundedness: lowestScore,
	reason: 'The arm gave no answer (fallback).'
};

export async function judgeAnswer(
	judgeModel: string,
	question: BenchmarkQuestion,
	answerMarkdown: string
): Promise<Judgement> {
	if (isFallbackAnswer(answerMarkdown)) return fallbackJudgement;
	const call = await requestToolCall(
		{
			system: judgePrompt,
			messages: [{ role: 'user', content: renderCase(question, answerMarkdown) }],
			tools: [scoreAnswerTool],
			maxTokens: maxJudgementTokens,
			model: judgeModel
		},
		scoreAnswerTool.name
	);
	return parseJudgement(call);
}

function renderCase(question: BenchmarkQuestion, answerMarkdown: string): string {
	return [
		`# Question\n${question.question}`,
		`# Gold answer\n${question.goldAnswer}`,
		`# Notes\n${question.notes ?? '(none)'}`,
		`# Candidate answer\n${answerMarkdown}`
	].join('\n\n');
}

function parseJudgement(input: unknown): Judgement {
	const candidate = (input ?? {}) as Record<string, unknown>;
	return {
		correctness: asScore(candidate.correctness),
		completeness: asScore(candidate.completeness),
		groundedness: asScore(candidate.groundedness),
		reason: typeof candidate.reason === 'string' ? candidate.reason : ''
	};
}

function asScore(candidate: unknown): number {
	if (typeof candidate !== 'number' || Number.isNaN(candidate)) return lowestScore;
	return Math.min(highestScore, Math.max(lowestScore, Math.round(candidate)));
}
