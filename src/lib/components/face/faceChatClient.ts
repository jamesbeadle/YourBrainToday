import type { FaceChatReply, FaceChatTurn } from '$lib/data/faceChatTypes';

export type FaceChatOutcome =
	| ({ kind: 'spoken' } & FaceChatReply)
	| { kind: 'refusal'; message: string };

const refusalMessages: Record<number, string> = {
	401: 'Sign in to talk to your expertise brain.',
	402: 'You are out of credits — top up to keep talking.',
	403: 'This account is currently restricted.'
};

const fallbackRefusal = 'I lost my train of thought — ask me that again.';

export async function requestSpokenReply(turns: FaceChatTurn[]): Promise<FaceChatOutcome> {
	try {
		const response = await fetch('/api/face-chat', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ turns })
		});
		if (!response.ok) {
			return { kind: 'refusal', message: refusalMessages[response.status] ?? fallbackRefusal };
		}
		const spoken: FaceChatReply = await response.json();
		return { kind: 'spoken', ...spoken };
	} catch {
		return { kind: 'refusal', message: fallbackRefusal };
	}
}
