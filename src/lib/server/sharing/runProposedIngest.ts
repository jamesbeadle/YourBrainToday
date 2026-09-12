import { downloadSourceFile } from '$lib/server/brain/downloadSourceFile';
import { getBrainContexts } from '$lib/server/brain/getBrainContexts';
import { getBrainPageIndex } from '$lib/server/brain/getBrainPageIndex';
import { getDomainBrain } from '$lib/server/entities/getDomainBrain';
import { ingestSource } from '$lib/server/brain/ingestSource';
import { proposeModelChanges } from './proposeModelChanges';
import { sourceContentBlock } from '$lib/server/brain/sourceContentBlock';
import type { StoredBrainSource } from '$lib/server/brain/findBrainSource';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function runProposedIngest(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	proposerEmail: string
): Promise<void> {
	const brain = await getDomainBrain(supabase, source.brainId);
	if (brain === null) throw new Error('That expertise brain no longer exists');
	const fileBytes = await downloadSourceFile(supabase, source.storagePath);
	const contentBlock = await sourceContentBlock(fileBytes, source.mimeType);
	const contexts = await getBrainContexts(supabase, source.brainId);
	const index = await getBrainPageIndex(supabase, source.brainId);
	const record = await ingestSource(contentBlock, source.filename, brain, contexts, index);
	await proposeModelChanges(supabase, source, record, proposerEmail);
}
