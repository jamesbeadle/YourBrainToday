import type { SupabaseClient } from '@supabase/supabase-js';
import { parseAccountRecord, type Account } from './accountRecord';

export async function findAccountByEmail(
	supabase: SupabaseClient,
	email: string
): Promise<Account | null> {
	const { data, error } = await supabase.rpc('account_by_email', { address: email.trim() });
	if (error) throw error;
	const row = (data as Record<string, unknown>[])[0];
	if (row === undefined) return null;
	return parseAccountRecord(row);
}
