export type UploadOutcome =
	| { status: 'ingested'; creditBalance: number }
	| { status: 'proposed'; creditBalance: number }
	| { status: 'out_of_credits' }
	| { status: 'rejected'; message: string }
	| { status: 'failed'; message: string };

export async function uploadSourceFile(file: File, brainId: string): Promise<UploadOutcome> {
	const grantResponse = await fetch('/api/brain/sources', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			brainId,
			filename: file.name,
			mimeType: file.type,
			byteCount: file.size
		})
	});
	if (grantResponse.status === 400) return { status: 'rejected', message: await messageFrom(grantResponse) };
	if (!grantResponse.ok) return { status: 'failed', message: 'The upload could not be started.' };
	const grant = await grantResponse.json();

	const storageResponse = await fetch(grant.uploadUrl, {
		method: 'PUT',
		headers: { 'content-type': file.type },
		body: file
	});
	if (!storageResponse.ok) return { status: 'failed', message: 'The file could not be uploaded.' };

	return ingestSource(grant.sourceId);
}

export async function ingestSource(sourceId: string): Promise<UploadOutcome> {
	const ingestResponse = await fetch('/api/brain/ingest', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ sourceId })
	});
	if (ingestResponse.status === 402) return { status: 'out_of_credits' };
	if (!ingestResponse.ok) return { status: 'failed', message: await messageFrom(ingestResponse) };
	const payload = await ingestResponse.json();
	if (payload.isProposal === true) return { status: 'proposed', creditBalance: payload.creditBalance };
	return { status: 'ingested', creditBalance: payload.creditBalance };
}

async function messageFrom(response: Response): Promise<string> {
	const fallbackMessage = 'Something went wrong — please try again.';
	const payload = await response.json().catch(() => null);
	if (payload === null || typeof payload.message !== 'string') return fallbackMessage;
	return payload.message;
}
