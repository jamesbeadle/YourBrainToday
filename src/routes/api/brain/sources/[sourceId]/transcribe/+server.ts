import { error, json } from '@sveltejs/kit';
import { findBrainSource, markSourceStatus } from '$lib/server/brain/findBrainSource';
import { getCreditBalance } from '$lib/server/credits/getCreditBalance';
import { isRecording } from '$lib/data/brainUploadRules';
import { refundCredits, spendCredits } from '$lib/server/credits/spendCredits';
import { requireSpendHeadroom } from '$lib/server/credits/requireSpendHeadroom';
import { settleTranscriptionCredits } from '$lib/server/credits/settleTranscriptionCredits';
import { transcribeSourceRecording } from '$lib/server/brain/transcribeSourceRecording';
import {
	transcriptionCreditsFor,
	transcriptionReserveCreditsFor
} from '$lib/data/transcriptionPricing';
import type { RecordingTranscript } from '$lib/server/transcription/transcribeAudio';
import type { StoredBrainSource } from '$lib/server/brain/findBrainSource';
import type { RequestHandler } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';

export const config = { maxDuration: 300 };

const failureSummaryLimit = 160;
const transcriptionSpendReason = 'recording_transcription';

export const POST: RequestHandler = async ({ locals, params }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to add recordings to your brain');

	const recording = await findBrainSource(locals.supabase, params.sourceId);
	if (recording === null) error(404, 'That recording could not be found');
	if (!isRecording(recording.mimeType)) {
		error(409, 'That source is not a recording waiting to be transcribed');
	}
	if (!wasAddedBy(recording, user.id)) {
		error(403, 'Only whoever added a recording can transcribe it');
	}
	await requireSpendHeadroom(locals.supabase, user.id);

	const reserve = transcriptionReserveCreditsFor(recording.byteCount);
	const spend = await spendCredits(locals.supabase, reserve, transcriptionSpendReason);
	if (spend === 'insufficient_credits') error(402, 'You are out of credits');
	if (spend === 'account_restricted') error(403, 'This account is currently restricted');

	const transcript = await transcribeOrRefund(locals.supabase, recording, user.id, reserve);
	const owed = transcriptionCreditsFor(transcript.durationSeconds);
	await settleTranscriptionCredits(user.id, reserve, owed, transcriptionSpendReason);
	return json({ creditBalance: await getCreditBalance(locals.supabase) });
};

function wasAddedBy(recording: StoredBrainSource, userId: string): boolean {
	return recording.storagePath.startsWith(`${userId}/`);
}

async function transcribeOrRefund(
	supabase: SupabaseClient,
	recording: StoredBrainSource,
	payerId: string,
	reserve: number
): Promise<RecordingTranscript> {
	try {
		return await transcribeSourceRecording(supabase, recording);
	} catch (failure) {
		console.error('Recording transcription failed', failure);
		await markSourceStatus(supabase, recording.id, 'failed', failureSummary(failure));
		await refundCredits(payerId, reserve, transcriptionSpendReason);
		error(502, 'Transcribing that recording failed — your credits have been refunded');
	}
}

function failureSummary(failure: unknown): string {
	const message = failure instanceof Error ? failure.message : 'Unknown failure';
	return message.slice(0, failureSummaryLimit);
}
