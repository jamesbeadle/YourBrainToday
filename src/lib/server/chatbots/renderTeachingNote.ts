import type { OpenKnowledgeGap } from './findOpenKnowledgeGap';

const longestFilenameQuestion = 60;

export const teachingNoteMimeType = 'text/plain';

export function renderTeachingNote(
	chatbotName: string,
	gap: OpenKnowledgeGap,
	answer: string
): string {
	return [
		'# Answer from the knowledge base owner',
		'',
		`A member asked the chatbot "${chatbotName}" a question the knowledge base could not answer.`,
		'The owner has answered it below. Treat the answer as authoritative knowledge of this domain,',
		'recorded so the chatbot can answer the same question next time.',
		'',
		'## The question',
		'',
		gap.question,
		'',
		'## What the knowledge base was missing',
		'',
		gap.missingKnowledge,
		'',
		"## The owner's answer",
		'',
		answer
	].join('\n');
}

export function teachingNoteFilename(question: string): string {
	if (question.length <= longestFilenameQuestion) return `Chatbot answer — ${question}`;
	return `Chatbot answer — ${question.slice(0, longestFilenameQuestion).trimEnd()}…`;
}
