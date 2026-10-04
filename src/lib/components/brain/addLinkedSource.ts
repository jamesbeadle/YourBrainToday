import { guardingConnection } from './connectionGuard';
import { readSourceStages } from './readSourceStages';
import type { UploadOutcome, UploadProgress } from './uploadSourceFile';

type LinkGrant = { sourceId: string; title: string };

const rejectedStatuses = [400, 422];

/** Asks the server to read a link into a source, then reads that source stage by stage. */
export async function addLinkedSource(
	link: string,
	brainId: string,
	onProgress: UploadProgress = () => {}
): Promise<UploadOutcome> {
	const granted = await guardingConnection(() => requestLink(link, brainId));
	if (!('sourceId' in granted)) return granted;
	return readSourceStages(granted.sourceId, onProgress);
}

async function requestLink(
	link: string,
	brainId: string
): Promise<LinkGrant | { status: 'rejected' | 'failed'; message: string }> {
	const response = await fetch('/api/brain/sources/link', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ brainId, url: link })
	});
	if (rejectedStatuses.includes(response.status)) {
		return { status: 'rejected', message: await messageFrom(response) };
	}
	if (!response.ok) return { status: 'failed', message: 'The link could not be read.' };
	return response.json();
}

async function messageFrom(response: Response): Promise<string> {
	const fallbackMessage = 'That link could not be read — please try another.';
	const payload = await response.json().catch(() => null);
	if (payload === null || typeof payload.message !== 'string') return fallbackMessage;
	return payload.message;
}
