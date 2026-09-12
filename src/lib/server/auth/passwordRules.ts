import type { EmailAndPassword } from './emailAndPassword';

export const minimumPasswordLength = 8;

const missingEmailAddress = 'Enter your email address.';
const passwordTooShort = `Passwords need at least ${minimumPasswordLength} characters.`;
const passwordsDoNotMatch = 'Those two passwords are not the same.';

/** A sentence for the person when the address cannot be used, or null when it can. */
export function problemWithEmailAddress(emailAddress: string): string | null {
	if (emailAddress === '') return missingEmailAddress;
	return null;
}

/** A sentence for the person when the credentials cannot be used, or null when they can. */
export function problemWithCredentials(credentials: EmailAndPassword): string | null {
	const { emailAddress, password } = credentials;
	const emailProblem = problemWithEmailAddress(emailAddress);
	if (emailProblem !== null) return emailProblem;
	if (password.length < minimumPasswordLength) return passwordTooShort;
	return null;
}

/** A sentence for the person when the chosen password cannot be used, or null when it can. */
export function problemWithNewPassword(password: string, confirmation: string): string | null {
	if (password.length < minimumPasswordLength) return passwordTooShort;
	if (password !== confirmation) return passwordsDoNotMatch;
	return null;
}
