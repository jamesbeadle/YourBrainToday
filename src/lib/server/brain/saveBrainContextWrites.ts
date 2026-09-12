import type { SupabaseClient } from '@supabase/supabase-js';

export type BrainContextWrite = {
	slug: string;
	name: string;
	summary: string;
	isCoreDomain: boolean;
};

export type AppliedContextWrite = { slug: string; wasCreated: boolean };

export async function saveBrainContextWrites(
	supabase: SupabaseClient,
	brainId: string,
	writes: BrainContextWrite[]
): Promise<AppliedContextWrite[]> {
	const applied: AppliedContextWrite[] = [];
	for (const write of writes) {
		applied.push(await saveContextWrite(supabase, brainId, write));
	}
	return applied;
}

async function saveContextWrite(
	supabase: SupabaseClient,
	brainId: string,
	write: BrainContextWrite
): Promise<AppliedContextWrite> {
	const row = { name: write.name, summary: write.summary, is_core_domain: write.isCoreDomain };
	const existingContext = await findContext(supabase, brainId, write.slug);
	if (existingContext === null) {
		const { error } = await supabase
			.from('brain_contexts')
			.insert({ brain_id: brainId, slug: write.slug, ...row });
		if (error !== null) throw error;
		return { slug: write.slug, wasCreated: true };
	}
	const { error } = await supabase
		.from('brain_contexts')
		.update(row)
		.eq('id', existingContext.id);
	if (error !== null) throw error;
	return { slug: write.slug, wasCreated: false };
}

async function findContext(supabase: SupabaseClient, brainId: string, slug: string) {
	const { data, error } = await supabase
		.from('brain_contexts')
		.select('id')
		.eq('brain_id', brainId)
		.eq('slug', slug)
		.maybeSingle();
	if (error !== null) throw error;
	return data;
}
