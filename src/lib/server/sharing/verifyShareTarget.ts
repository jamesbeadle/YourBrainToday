import type { SupabaseClient } from '@supabase/supabase-js';
import type { ShareScope } from '$lib/data/sharingTypes';

export async function verifyShareTarget(
	supabase: SupabaseClient,
	userId: string,
	scope: ShareScope,
	targetId: string
): Promise<{ name: string } | null> {
	const table = scope === 'brain' ? 'domain_brains' : 'entities';
	const { data, error } = await supabase
		.from(table)
		.select('name, owner_id')
		.eq('id', targetId)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null || data.owner_id !== userId) return null;
	return { name: data.name };
}
