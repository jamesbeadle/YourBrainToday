import type { SupabaseClient } from '@supabase/supabase-js';
import { creditAdjustmentLimit } from '$lib/data/creditAdjustments';

export type CreditAdjustment = {
	targetEmail: string;
	creditDelta: number;
	note: string;
};

export function readCreditAdjustment(formData: FormData): CreditAdjustment | { message: string } {
	const targetEmail = String(formData.get('targetEmail') ?? '');
	const creditDelta = Number(formData.get('creditDelta'));
	const note = String(formData.get('note') ?? '').trim();
	if (targetEmail === '') return { message: 'A user is required.' };
	if (!isAllowedDelta(creditDelta)) {
		return {
			message: `A non-zero whole number of credits, up to ${creditAdjustmentLimit} either way, is required.`
		};
	}
	if (note === '') return { message: 'A note saying why is required.' };
	return { targetEmail, creditDelta, note };
}

function isAllowedDelta(creditDelta: number): boolean {
	if (!Number.isInteger(creditDelta) || creditDelta === 0) return false;
	return Math.abs(creditDelta) <= creditAdjustmentLimit;
}

export async function adjustCredits(
	supabase: SupabaseClient,
	adjustment: CreditAdjustment
): Promise<number> {
	const { data, error } = await supabase.rpc('admin_adjust_credits', {
		target_email: adjustment.targetEmail,
		credit_delta: adjustment.creditDelta,
		note: adjustment.note
	});
	if (error) throw error;
	return data;
}
