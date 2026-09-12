import { defaultMemberAllowanceCredits } from '$lib/data/chatbotTypes';

const mostAllowanceCredits = 100_000;

export function parseInvitedEmail(formData: FormData): string {
	return String(formData.get('email') ?? '').trim();
}

// A blank field means the default; anything else must be a whole number of credits.
export function parseInvitedAllowance(formData: FormData): number | null {
	const typed = String(formData.get('allowance') ?? '').trim();
	if (typed === '') return defaultMemberAllowanceCredits;
	const allowance = Number(typed);
	if (!Number.isInteger(allowance) || allowance < 0 || allowance > mostAllowanceCredits) return null;
	return allowance;
}
