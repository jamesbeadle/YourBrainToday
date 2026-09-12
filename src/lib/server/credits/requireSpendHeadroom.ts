import { error } from '@sveltejs/kit';
import { countRecentSpends } from './recentSpendCount';
import type { SupabaseClient } from '@supabase/supabase-js';

export const mostSpendsPerMinute = 30;
export const slowDownMessage = 'Slow down — try again in a minute';

export async function requireSpendHeadroom(
	supabase: SupabaseClient,
	userId: string,
	reason?: string
): Promise<void> {
	const recentSpends = await countRecentSpends(supabase, userId, reason);
	if (recentSpends >= mostSpendsPerMinute) error(429, slowDownMessage);
}
