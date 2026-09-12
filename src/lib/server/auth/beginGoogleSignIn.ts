import type { SupabaseClient } from '@supabase/supabase-js';
import { callbackUrlFor } from './callbackUrlFor';

export async function beginGoogleSignIn(
	supabase: SupabaseClient,
	origin: string,
	destination: string | null = null
): Promise<string> {
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: 'google',
		options: { redirectTo: callbackUrlFor(origin, destination) }
	});
	if (error) throw error;
	return data.url;
}
