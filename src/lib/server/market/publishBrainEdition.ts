import { recordBrainEvent } from '$lib/server/brain/recordBrainEvent';
import type { SupabaseClient } from '@supabase/supabase-js';

export type EditionPublish = { snapshotBrainId: string } | 'no_listing' | 'edition_needs_a_name';

export async function publishBrainEdition(
	supabase: SupabaseClient,
	brainId: string,
	editionName: string
): Promise<EditionPublish> {
	const { data, error } = await supabase.rpc('publish_brain_edition', {
		source_brain: brainId,
		edition_name: editionName
	});
	if (error !== null && error.message.includes('no_listing')) return 'no_listing';
	if (error !== null && error.message.includes('edition_needs_a_name')) {
		return 'edition_needs_a_name';
	}
	if (error !== null) throw error;
	await recordBrainEvent(supabase, {
		brainId,
		kind: 'edition_published',
		detail: { editionName, snapshotBrainId: data }
	});
	return { snapshotBrainId: data };
}
