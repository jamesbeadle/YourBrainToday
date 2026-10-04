import { error } from '@sveltejs/kit';
import { longestQuestion } from '$lib/data/questionLimits';

/** The question a request body carries, trimmed to the longest a brain will take. */
export function readQuestion(payload: { question?: unknown }): string {
	const question = typeof payload.question === 'string' ? payload.question.trim() : '';
	if (question === '') error(400, 'A question is required');
	return question.slice(0, longestQuestion);
}
