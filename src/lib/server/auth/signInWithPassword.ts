import type { SupabaseClient } from '@supabase/supabase-js';
import type { EmailAndPassword } from './emailAndPassword';

const unconfirmedEmailCode = 'email_not_confirmed';
const confirmYourAddressFirst = 'Confirm your email address first — the link is in your inbox.';
const credentialsNotRecognised = 'That email address and password do not match an account.';

/** A sentence for the person when sign-in failed, or null once they are signed in. */
export async function signInWithPassword(
	supabase: SupabaseClient,
	{ emailAddress, password }: EmailAndPassword
): Promise<string | null> {
	const { error } = await supabase.auth.signInWithPassword({ email: emailAddress, password });
	if (error === null) return null;
	if (error.code === unconfirmedEmailCode) return confirmYourAddressFirst;
	return credentialsNotRecognised;
}
