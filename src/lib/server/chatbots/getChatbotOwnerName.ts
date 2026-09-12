import { unnamedChatbotOwner } from '$lib/data/chatbotQuietMessages';
import type { SupabaseClient } from '@supabase/supabase-js';

// Members cannot read the owner's profile, so this runs on the service
// client — only once membership of the owner's bot has been proven.
export async function getChatbotOwnerName(service: SupabaseClient, ownerId: string): Promise<string> {
	const { data, error } = await service
		.from('profiles')
		.select('display_name, email')
		.eq('id', ownerId)
		.maybeSingle();
	if (error !== null) throw error;
	const displayName = String(data?.display_name ?? '').trim();
	if (displayName !== '') return displayName;
	const email = String(data?.email ?? '').trim();
	return email === '' ? unnamedChatbotOwner : email;
}
