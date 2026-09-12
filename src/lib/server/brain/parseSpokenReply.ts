import {
	faceExpressionNames,
	type FaceChatReply,
	type FaceExpressionName
} from '$lib/data/faceChatTypes';

const fallbackReply = 'I could not put a reply together — ask me that again.';

export function parseSpokenReply(input: unknown): FaceChatReply {
	if (typeof input !== 'object' || input === null) {
		return { reply: fallbackReply, expression: 'neutral', citedSlugs: [] };
	}
	const candidate = input as { reply?: unknown; expression?: unknown; citedSlugs?: unknown };
	return {
		reply: asSpokenText(candidate.reply),
		expression: asExpression(candidate.expression),
		citedSlugs: asSlugList(candidate.citedSlugs)
	};
}

function asSpokenText(candidate: unknown): string {
	if (typeof candidate !== 'string' || candidate.trim() === '') return fallbackReply;
	return candidate.trim();
}

function asExpression(candidate: unknown): FaceExpressionName {
	const match = faceExpressionNames.find((name) => name === candidate);
	return match ?? 'neutral';
}

function asSlugList(candidate: unknown): string[] {
	if (!Array.isArray(candidate)) return [];
	return candidate.filter((slug): slug is string => typeof slug === 'string');
}
