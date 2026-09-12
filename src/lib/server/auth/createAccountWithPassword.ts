import type { SupabaseClient } from '@supabase/supabase-js';
import type { EmailAndPassword } from './emailAndPassword';

const tooManyEmailsCode = 'over_email_send_rate_limit';
const tryAgainShortly = 'That was a lot of attempts — try again in a few minutes.';
const couldNotCreateAccount = 'We could not create an account with those details.';

/** A sentence for the person when signing up failed, or null once the email is on its way. */
export async function createAccountWithPassword(
	supabase: SupabaseClient,
	{ emailAddress, password }: EmailAndPassword,
	verificationLink: string
): Promise<string | null> {
	const { error } = await supabase.auth.signUp({
		email: emailAddress,
		password,
		options: { emailRedirectTo: verificationLink }
	});
	if (error === null) return null;
	if (error.code === tooManyEmailsCode) return tryAgainShortly;
	return couldNotCreateAccount;
}
