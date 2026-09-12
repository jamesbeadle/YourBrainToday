import type { ChatbotAnswer } from '$lib/data/chatbotTypes';

export type ChatbotAskResult =
	| { kind: 'answered'; answer: ChatbotAnswer; allowanceRemaining: number }
	| { kind: 'refused'; message: string }
	| { kind: 'failed'; message: string };

const fallbackFailure = 'Something went wrong on my end — please try that again.';

export async function askChatbotEndpoint(
	chatbotId: string,
	question: string
): Promise<ChatbotAskResult> {
	const response = await fetch(`/api/chatbots/${chatbotId}/ask`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ question })
	});
	if (response.ok) {
		const payload = await response.json();
		return {
			kind: 'answered',
			answer: {
				answerMarkdown: payload.answerMarkdown,
				citedPageKeys: payload.citedPageKeys,
				missingKnowledge: payload.missingKnowledge ?? null
			},
			allowanceRemaining: payload.allowanceRemaining
		};
	}
	const message = await readErrorMessage(response);
	if (response.status === 402 || response.status === 403) return { kind: 'refused', message };
	return { kind: 'failed', message };
}

async function readErrorMessage(response: Response): Promise<string> {
	const payload = await response.json().catch(() => null);
	return typeof payload?.message === 'string' ? payload.message : fallbackFailure;
}
