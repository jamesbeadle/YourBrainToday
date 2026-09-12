import type { BrainAnswer } from '$lib/data/brainTypes';

const fallbackAnswer = 'I could not put an answer together — please try again.';

export function parseBrainAnswer(input: unknown): BrainAnswer {
	if (typeof input !== 'object' || input === null) {
		return { answerMarkdown: fallbackAnswer, citedSlugs: [] };
	}
	const candidate = input as { answerMarkdown?: unknown; citedSlugs?: unknown };
	return {
		answerMarkdown: asAnswerText(candidate.answerMarkdown),
		citedSlugs: asSlugList(candidate.citedSlugs)
	};
}

export function parseRequestedSlugs(input: unknown): string[] {
	if (typeof input !== 'object' || input === null) return [];
	return asSlugList((input as { slugs?: unknown }).slugs);
}

function asAnswerText(candidate: unknown): string {
	if (typeof candidate !== 'string' || candidate.trim() === '') return fallbackAnswer;
	return candidate;
}

function asSlugList(candidate: unknown): string[] {
	if (!Array.isArray(candidate)) return [];
	return candidate.filter((slug): slug is string => typeof slug === 'string');
}
