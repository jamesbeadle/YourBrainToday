export type RereadOutcome =
	| { status: 'reread'; creditBalance: number }
	| { status: 'out_of_credits' }
	| { status: 'failed'; message: string };

export async function rereadSource(sourceId: string): Promise<RereadOutcome> {
	const response = await fetch(`/api/brain/sources/${sourceId}/reread`, { method: 'POST' });
	if (response.status === 402) return { status: 'out_of_credits' };
	if (!response.ok) return { status: 'failed', message: await messageFrom(response) };
	const payload = await response.json();
	return { status: 'reread', creditBalance: payload.creditBalance };
}

async function messageFrom(response: Response): Promise<string> {
	const fallbackMessage = 'The document could not be re-read — please try again.';
	const payload = await response.json().catch(() => null);
	if (payload === null || typeof payload.message !== 'string') return fallbackMessage;
	return payload.message;
}
