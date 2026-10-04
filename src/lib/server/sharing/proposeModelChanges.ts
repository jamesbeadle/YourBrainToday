import { proposalRowsFor } from './proposalRows';
import { markSourceStatus, type StoredBrainSource } from '$lib/server/brain/findBrainSource';
import { recordBrainEvent } from '$lib/server/brain/recordBrainEvent';
import type { IngestRecord } from '$lib/server/brain/parseIngestRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function proposeModelChanges(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	record: IngestRecord,
	proposerEmail: string
): Promise<number> {
	const origin = {
		brainId: source.brainId,
		proposerEmail,
		sourceId: source.id,
		sourceFilename: source.filename
	};
	const rows = await proposalRowsFor(supabase, origin, record);
	const { error } = await supabase.from('brain_change_proposals').insert(rows);
	if (error !== null) throw error;
	await recordBrainEvent(supabase, {
		brainId: source.brainId,
		kind: 'changes_proposed',
		detail: { filename: source.filename, changeCount: rows.length, proposerEmail },
		sourceId: source.id
	});
	await markSourceStatus(supabase, source.id, 'proposed', record.sourceSummary);
	return rows.length;
}
