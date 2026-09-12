export type RemovalOutcome =
	| { status: 'removed'; creditBalance: number }
	| { status: 'out_of_credits' }
	| { status: 'failed'; message: string };

export async function removeSource(sourceId: string): Promise<RemovalOutcome> {
	const response = await fetch(`/api/brain/sources/${sourceId}`, { method: 'DELETE' });
	if (response.status === 402) return { status: 'out_of_credits' };
	if (!response.ok) return { status: 'failed', message: await messageFrom(response) };
	const payload = await response.json();
	return { status: 'removed', creditBalance: payload.creditBalance };
}

async function messageFrom(response: Response): Promise<string> {
	const fallbackMessage = 'The document could not be removed — please try again.';
	const payload = await response.json().catch(() => null);
	if (payload === null || typeof payload.message !== 'string') return fallbackMessage;
	return payload.message;
}
