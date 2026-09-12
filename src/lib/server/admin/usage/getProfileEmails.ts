import type { SupabaseClient } from '@supabase/supabase-js';

export async function getProfileEmails(service: SupabaseClient): Promise<Map<string, string>> {
	const { data, error } = await service.from('profiles').select('id, email');
	if (error !== null) throw error;
	return new Map(data.map((row) => [row.id as string, row.email as string]));
}
