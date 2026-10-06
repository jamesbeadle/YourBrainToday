import { isReadingStage, parseReadingProgress } from '$lib/data/sourceReading';
import type { BrainSourceStatus } from '$lib/data/brainSourceTypes';
import type { ReadingProgress, ReadingStage } from '$lib/data/sourceReading';
import type { SupabaseClient } from '@supabase/supabase-js';

export type StoredBrainSource = {
	id: string;
	brainId: string;
	filename: string;
	mimeType: string;
	storagePath: string;
	status: BrainSourceStatus;
	byteCount: number;
	summary: string;
	stage: ReadingStage | null;
	stageStartedAt: string | null;
	failure: string;
	reservedCredits: number;
	progress: ReadingProgress;
};

export const storedSourceColumns: string =
	'id, brain_id, filename, mime_type, storage_path, status, byte_count, summary, stage, ' +
	'stage_started_at, failure, reserved_credits, progress';

export async function findBrainSource(
	supabase: SupabaseClient,
	sourceId: string
): Promise<StoredBrainSource | null> {
	const { data, error } = await supabase
		.from('brain_sources')
		.select(storedSourceColumns)
		.eq('id', sourceId)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return asStoredSource(data as unknown as Record<string, unknown>);
}

export function asStoredSource(row: Record<string, unknown>): StoredBrainSource {
	return {
		id: String(row.id),
		brainId: String(row.brain_id),
		filename: String(row.filename),
		mimeType: String(row.mime_type),
		storagePath: String(row.storage_path),
		status: row.status as BrainSourceStatus,
		byteCount: Number(row.byte_count ?? 0),
		summary: String(row.summary ?? ''),
		stage: isReadingStage(row.stage) ? row.stage : null,
		stageStartedAt: typeof row.stage_started_at === 'string' ? row.stage_started_at : null,
		failure: String(row.failure ?? ''),
		reservedCredits: Number(row.reserved_credits ?? 0),
		progress: parseReadingProgress(row.progress)
	};
}

export async function markSourceStatus(
	supabase: SupabaseClient,
	sourceId: string,
	status: BrainSourceStatus,
	summary = ''
): Promise<void> {
	const { error } = await supabase
		.from('brain_sources')
		.update({ status, ...(summary === '' ? {} : { summary }) })
		.eq('id', sourceId);
	if (error !== null) throw error;
}
