import type { SupabaseClient } from '@supabase/supabase-js';

export async function getCreditBalance(supabase: SupabaseClient): Promise<number> {
	const { data, error } = await supabase.rpc('credit_balance');
	if (error) throw error;
	return data ?? 0;
}
