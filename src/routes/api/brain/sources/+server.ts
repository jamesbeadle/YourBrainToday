import { error, json } from '@sveltejs/kit';
import { createBrainSource } from '$lib/server/brain/createBrainSource';
import { getDomainBrain } from '$lib/server/entities/getDomainBrain';
import { isAcceptedUpload, isRecording, uploadLimitDescription } from '$lib/data/brainUploadRules';
import { isTranscriptionConfigured } from '$lib/server/transcription/transcribeAudio';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, request }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to add documents to your expertise brain');

	const upload = await readUploadRequest(request);
	if (!isAcceptedUpload(upload.mimeType, upload.byteCount)) {
		error(400, `That file type or size is not supported. ${uploadLimitDescription()}`);
	}
	if (isRecording(upload.mimeType) && !isTranscriptionConfigured()) {
		error(400, 'Voice recordings cannot be transcribed yet — transcription is not set up.');
	}
	const brain = await getDomainBrain(locals.supabase, upload.brainId);
	if (brain === null) error(404, 'That expertise brain could not be found');

	const grant = await createBrainSource(locals.supabase, user.id, brain.id, upload);
	return json(grant);
};

async function readUploadRequest(
	request: Request
): Promise<{ brainId: string; filename: string; mimeType: string; byteCount: number }> {
	const payload = await request.json();
	const brainId = typeof payload.brainId === 'string' ? payload.brainId : '';
	const filename = typeof payload.filename === 'string' ? payload.filename.trim() : '';
	const mimeType = typeof payload.mimeType === 'string' ? payload.mimeType : '';
	const byteCount = Number(payload.byteCount);
	if (brainId === '' || filename === '' || mimeType === '' || !Number.isInteger(byteCount)) {
		error(400, 'A expertise brain, filename, mime type, and byte count are required');
	}
	return { brainId, filename, mimeType, byteCount };
}
