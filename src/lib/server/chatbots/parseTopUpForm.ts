import { isUuid } from '$lib/data/isUuid';
import type { MemberAllowance } from '$lib/data/chatbotTypes';

const allowanceFieldPrefix = 'allowance:';
const mostCreditsPerTopUp = 100_000;

export function parseCredits(formData: FormData): number | null {
	const credits = Number(formData.get('credits'));
	if (!Number.isInteger(credits) || credits <= 0 || credits > mostCreditsPerTopUp) return null;
	return credits;
}

export function parseAllowances(formData: FormData): MemberAllowance[] {
	const allowances: MemberAllowance[] = [];
	for (const [field, value] of formData.entries()) {
		if (!field.startsWith(allowanceFieldPrefix)) continue;
		const memberId = field.slice(allowanceFieldPrefix.length);
		if (!isUuid(memberId)) continue;
		const allowance = Number(value);
		allowances.push({
			memberId,
			allowance: Number.isInteger(allowance) && allowance > 0 ? allowance : 0
		});
	}
	return allowances;
}
