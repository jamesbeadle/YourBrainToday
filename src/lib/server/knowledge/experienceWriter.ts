import { createBrainItem } from './createBrainItem';
import type { HarvestedEvent } from '$lib/server/agent/parseHarvest';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function fileExperienceEvents(
	supabase: SupabaseClient,
	brainId: string,
	events: HarvestedEvent[],
	knownTerms: string[],
	provenance = 'stated'
): Promise<void> {
	const casesByName = await existingCases(supabase, brainId);
	const knownTermSet = new Set(knownTerms.map((term) => term.toLowerCase()));
	for (const event of events) {
		await createBrainItem(supabase, {
			brainId,
			itemKind: 'episode',
			title: event.title,
			body: event.note,
			occurredAt: event.occurredAt ?? new Date().toISOString(),
			parentItemId: await caseIdFor(supabase, brainId, casesByName, event.caseName),
			data: episodeDataFor(event.terms, knownTermSet, provenance)
		});
	}
}

async function existingCases(
	supabase: SupabaseClient,
	brainId: string
): Promise<Map<string, string>> {
	const { data, error } = await supabase
		.from('kb_brain_items')
		.select('id, title')
		.eq('brain_id', brainId)
		.eq('item_kind', 'case');
	if (error !== null) throw error;
	return new Map(
		(data ?? []).map((row) => [(row.title as string).toLowerCase(), row.id as string])
	);
}

async function caseIdFor(
	supabase: SupabaseClient,
	brainId: string,
	casesByName: Map<string, string>,
	caseName: string | null
): Promise<string | null> {
	if (caseName === null) return null;
	const existingId = casesByName.get(caseName.toLowerCase());
	if (existingId !== undefined) return existingId;
	const caseId = await createBrainItem(supabase, {
		brainId,
		itemKind: 'case',
		title: caseName,
		data: { problem: '', approach: '', outcome: '', status: 'open' }
	});
	casesByName.set(caseName.toLowerCase(), caseId);
	return caseId;
}

function episodeDataFor(
	terms: string[],
	knownTermSet: Set<string>,
	provenance: string
): Record<string, unknown> {
	return {
		terms: terms.filter((term) => knownTermSet.has(term.toLowerCase())),
		newTerms: terms.filter((term) => !knownTermSet.has(term.toLowerCase())),
		provenance
	};
}
