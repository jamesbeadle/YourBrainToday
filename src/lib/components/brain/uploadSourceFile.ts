import { guardingConnection } from './connectionGuard';
import { readSourceStages, type ReadingOutcome } from './readSourceStages';
import { mimeTypeFor } from '$lib/data/brainUploadRules';

export type UploadOutcome = ReadingOutcome | { status: 'rejected'; message: string };

export type UploadProgress = (stage: string) => void;

type Grant = { sourceId: string; uploadUrl: string };

/** Grants an upload, sends the file straight to storage, then reads it stage by stage. */
export async function uploadSourceFile(
	file: File,
	brainId: string,
	onProgress: UploadProgress = () => {}
): Promise<UploadOutcome> {
	const granted = await guardingConnection(() => requestGrant(file, brainId));
	if (!('uploadUrl' in granted)) return granted;
	const sent = await guardingConnection(() => sendToStorage(file, granted));
	if (sent.status === 'failed') {
		await discardGrant(granted.sourceId);
		return sent;
	}
	return readSourceStages(granted.sourceId, onProgress);
}

async function requestGrant(
	file: File,
	brainId: string
): Promise<Grant | { status: 'rejected' | 'failed'; message: string }> {
	const mimeType = mimeTypeFor(file.name, file.type);
	const response = await fetch('/api/brain/sources', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			brainId,
			filename: file.name,
			mimeType,
			byteCount: file.size
		})
	});
	if (response.status === 400) return { status: 'rejected', message: await messageFrom(response) };
	if (!response.ok) return { status: 'failed', message: 'The upload could not be started.' };
	return response.json();
}

async function sendToStorage(
	file: File,
	grant: Grant
): Promise<{ status: 'sent' } | { status: 'failed'; message: string }> {
	const response = await fetch(grant.uploadUrl, {
		method: 'PUT',
		headers: { 'content-type': mimeTypeFor(file.name, file.type) },
		body: file
	});
	if (!response.ok) return { status: 'failed', message: 'The file could not be uploaded.' };
	return { status: 'sent' };
}

/** A granted row whose file never arrived is deleted, so no empty "Waiting" row is left behind. */
async function discardGrant(sourceId: string): Promise<void> {
	await fetch(`/api/brain/sources/${sourceId}`, { method: 'DELETE' }).catch(() => undefined);
}

async function messageFrom(response: Response): Promise<string> {
	const fallbackMessage = 'Something went wrong — please try again.';
	const payload = await response.json().catch(() => null);
	if (payload === null || typeof payload.message !== 'string') return fallbackMessage;
	return payload.message;
}
