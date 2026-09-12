import type { SupabaseClient } from '@supabase/supabase-js';

export type McpRole = 'owner' | 'none';

export type AccountStanding = {
	accountId: string;
	email: string;
	role: McpRole;
	isAdmin: boolean;
};

export async function resolveAccountStanding(
	supabase: SupabaseClient,
	accountId: string
): Promise<AccountStanding> {
	const { data, error } = await supabase
		.from('profiles')
		.select('email, is_admin, is_restricted')
		.eq('id', accountId)
		.maybeSingle();
	if (error) throw error;
	const email = data?.email ?? '';
	if (data === null || data.is_restricted === true) return nobody(accountId, email);
	return { accountId, email, role: 'owner', isAdmin: data.is_admin === true };
}

function nobody(accountId: string, email: string): AccountStanding {
	return { accountId, email, role: 'none', isAdmin: false };
}
