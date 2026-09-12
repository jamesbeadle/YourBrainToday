import { invalidateAll } from '$app/navigation';

export type TerminalAsk = (question: string, conversationId: string | null) => Promise<void>;

export function createTerminalAsk(dependencies: {
	brainId: string;
	appendLine: (line: string) => void;
	onOutOfCredits: () => void;
	setPendingQuestion: (question: string | null) => void;
}): TerminalAsk {
	const { brainId, appendLine, onOutOfCredits, setPendingQuestion } = dependencies;

	return async function ask(question: string, conversationId: string | null): Promise<void> {
		setPendingQuestion(question);
		const response = await fetch('/api/brain/ask', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ brainId, question, conversationId })
		});
		if (response.ok) await invalidateAll();
		setPendingQuestion(null);
		if (response.status === 402) return onOutOfCredits();
		if (!response.ok) {
			const failure = await response.json().catch(() => null);
			appendLine(`✗ ${failure?.message ?? 'that turn went wrong — try again'}`);
		}
	};
}
