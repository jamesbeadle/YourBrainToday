import { readSourceStages, type ReadingOutcome } from './readSourceStages';
import { mimeTypeFor } from '$lib/data/brainUploadRules';

export type UploadOutcome = ReadingOutcome | { status: 'rejected'; message: string };

export type UploadProgress = (stage: string) => void;

/** Grants an upload, sends the file straight to storage, then reads it stage by stage. */
export async function uploadSourceFile(
	file: File,
	brainId: string,
	onProgress: UploadProgress = () => {}
): Promise<UploadOutcome> {
	onProgress('sending the file');
	const mimeType = mimeTypeFor(file.name, file.type);
	const grantResponse = await fetch('/api/brain/sources', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ brainId, filename: file.name, mimeType, byteCount: file.size })
	});
	if (grantResponse.status === 400) return { status: 'rejected', message: await messageFrom(grantResponse) };
	if (!grantResponse.ok) return { status: 'failed', message: 'The upload could not be started.' };
	const grant = await grantResponse.json();

	const storageResponse = await fetch(grant.uploadUrl, {
		method: 'PUT',
		headers: { 'content-type': mimeType },
		body: file
	});
	if (!storageResponse.ok) return { status: 'failed', message: 'The file could not be uploaded.' };

	return readSourceStages(grant.sourceId, onProgress);
}

async function messageFrom(response: Response): Promise<string> {
	const fallbackMessage = 'Something went wrong — please try again.';
	const payload = await response.json().catch(() => null);
	if (payload === null || typeof payload.message !== 'string') return fallbackMessage;
	return payload.message;
}
