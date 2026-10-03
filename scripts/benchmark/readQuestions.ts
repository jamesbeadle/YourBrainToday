import { readFileSync } from 'node:fs';
import type { BenchmarkQuestion } from './benchmarkTypes';

const brains = ['expertise', 'experience', 'process', 'human', 'cross'];

export function readQuestions(questionsPath: string): BenchmarkQuestion[] {
	const parsed: unknown = JSON.parse(readFileSync(questionsPath, 'utf8'));
	if (!Array.isArray(parsed) || parsed.length === 0) {
		throw new Error(`${questionsPath} must hold a non-empty JSON array of questions`);
	}
	return parsed.map((candidate, index) => asQuestion(candidate, index));
}

function asQuestion(candidate: unknown, index: number): BenchmarkQuestion {
	const record = (candidate ?? {}) as Record<string, unknown>;
	const id = typeof record.id === 'string' && record.id !== '' ? record.id : `q${index + 1}`;
	for (const field of ['question', 'goldAnswer']) {
		if (typeof record[field] !== 'string' || record[field] === '') {
			throw new Error(`Question ${id} needs a non-empty "${field}"`);
		}
	}
	if (!brains.includes(String(record.brain))) {
		throw new Error(`Question ${id} needs "brain" to be one of ${brains.join(', ')}`);
	}
	return {
		id,
		question: record.question as string,
		goldAnswer: record.goldAnswer as string,
		brain: record.brain as BenchmarkQuestion['brain'],
		notes: typeof record.notes === 'string' ? record.notes : undefined
	};
}
