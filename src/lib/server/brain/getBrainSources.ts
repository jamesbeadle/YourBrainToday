import { isReadingStage, parseReadingProgress } from '$lib/data/sourceReading';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { BrainSource } from '$lib/data/brainTypes';

const sourceColumns: string =
	'id, filename, mime_type, byte_count, status, summary, arrived_through, created_at, stage, ' +
	'stage_started_at, failure, progress';

export async function getBrainSources(
	supabase: SupabaseClient,
	brainId: string
): Promise<BrainSource[]> {
	const { data, error } = await supabase
		.from('brain_sources')
		.select(sourceColumns)
		.eq('brain_id', brainId)
		.order('created_at', { ascending: false });
	if (error !== null) throw error;
	return ((data ?? []) as unknown as Record<string, unknown>[]).map(asBrainSource);
}

export function asBrainSource(row: Record<string, unknown>): BrainSource {
	return {
		id: String(row.id),
		filename: String(row.filename),
		mimeType: String(row.mime_type),
		byteCount: Number(row.byte_count ?? 0),
		status: row.status as BrainSource['status'],
		summary: String(row.summary ?? ''),
		arrivedThrough: row.arrived_through as BrainSource['arrivedThrough'],
		createdAt: String(row.created_at),
		stage: isReadingStage(row.stage) ? row.stage : null,
		stageStartedAt: typeof row.stage_started_at === 'string' ? row.stage_started_at : null,
		failure: String(row.failure ?? ''),
		progress: parseReadingProgress(row.progress)
	};
}
