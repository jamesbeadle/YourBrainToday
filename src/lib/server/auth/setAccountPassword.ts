import type { SupabaseClient } from '@supabase/supabase-js';

const samePasswordCode = 'same_password';
const chooseADifferentPassword = 'That is already your password — choose a different one.';
const couldNotSavePassword = 'We could not save that password — open the link in your email again.';

/** A sentence for the person when the password could not be saved, or null once it is theirs. */
export async function setAccountPassword(
	supabase: SupabaseClient,
	password: string
): Promise<string | null> {
	const { error } = await supabase.auth.updateUser({ password });
	if (error === null) return null;
	if (error.code === samePasswordCode) return chooseADifferentPassword;
	return couldNotSavePassword;
}
