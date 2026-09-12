import { getBrainContexts } from '$lib/server/brain/getBrainContexts';
import { getBrainPagesBySlugs } from '$lib/server/brain/getBrainPage';
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
	const rows = [
		...(await contextProposalRows(supabase, source, record, proposerEmail)),
		...(await pageProposalRows(supabase, source, record, proposerEmail))
	];
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

async function contextProposalRows(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	record: IngestRecord,
	proposerEmail: string
) {
	const contexts = await getBrainContexts(supabase, source.brainId);
	return record.contextWrites.map((write) => ({
		brain_id: source.brainId,
		proposer_email: proposerEmail,
		source_id: source.id,
		source_filename: source.filename,
		change_kind: 'context_write',
		slug: write.slug,
		title: write.name,
		payload: write,
		before: contexts.find((context) => context.slug === write.slug) ?? null
	}));
}

async function pageProposalRows(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	record: IngestRecord,
	proposerEmail: string
) {
	const slugs = record.pageWrites.map((write) => write.slug);
	const beforePages = await getBrainPagesBySlugs(supabase, source.brainId, slugs);
	return record.pageWrites.map((write) => ({
		brain_id: source.brainId,
		proposer_email: proposerEmail,
		source_id: source.id,
		source_filename: source.filename,
		change_kind: 'page_write',
		slug: write.slug,
		title: write.title,
		payload: write,
		before: beforePages.find((page) => page.slug === write.slug) ?? null
	}));
}
