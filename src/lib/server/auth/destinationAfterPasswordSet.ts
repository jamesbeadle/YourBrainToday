import type { SupabaseClient } from '@supabase/supabase-js';
import { homeDestinationFor } from './localDestination';

export async function destinationAfterPasswordSet(
	supabase: SupabaseClient,
	accountId: string
): Promise<string> {
	return homeDestinationFor(supabase, accountId);
}
