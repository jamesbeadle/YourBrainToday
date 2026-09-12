import type { SupabaseClient } from '@supabase/supabase-js';

export type ResolvedAccount = { id: string; email: string };

type ResolvedRow = { account_id: string; account_email: string };

export async function resolveAccountByEmail(
	supabase: SupabaseClient,
	email: string
): Promise<ResolvedAccount | null> {
	const { data, error } = await supabase.rpc('resolve_account_email', { candidate: email });
	if (error !== null) throw error;
	const [account] = (data ?? []) as ResolvedRow[];
	if (account === undefined) return null;
	return { id: account.account_id, email: account.account_email };
}
