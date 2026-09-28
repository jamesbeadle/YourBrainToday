export type TranscriptionOutcome =
	| { status: 'transcribed' }
	| { status: 'out_of_credits' }
	| { status: 'failed'; message: string };

export async function transcribeRecording(sourceId: string): Promise<TranscriptionOutcome> {
	const response = await fetch(`/api/brain/sources/${sourceId}/transcribe`, { method: 'POST' });
	if (response.status === 402) return { status: 'out_of_credits' };
	if (!response.ok) return { status: 'failed', message: await messageFrom(response) };
	return { status: 'transcribed' };
}

async function messageFrom(response: Response): Promise<string> {
	const fallbackMessage = 'The recording could not be transcribed — please try again.';
	const payload = await response.json().catch(() => null);
	if (payload === null || typeof payload.message !== 'string') return fallbackMessage;
	return payload.message;
}
