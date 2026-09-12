import type { SupabaseClient } from '@supabase/supabase-js';

export type PayoutDetails = {
	accountHolder: string;
	sortCode: string;
	accountNumber: string;
};

export async function getPayoutDetails(supabase: SupabaseClient): Promise<PayoutDetails | null> {
	const { data, error } = await supabase
		.from('payout_details')
		.select('account_holder, sort_code, account_number')
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return {
		accountHolder: data.account_holder,
		sortCode: data.sort_code,
		accountNumber: data.account_number
	};
}

export async function savePayoutDetails(
	supabase: SupabaseClient,
	details: PayoutDetails
): Promise<void> {
	const { error } = await supabase.from('payout_details').upsert({
		account_holder: details.accountHolder,
		sort_code: details.sortCode,
		account_number: details.accountNumber,
		updated_at: new Date().toISOString()
	});
	if (error !== null) throw error;
}

export function parsePayoutDetailsForm(formData: FormData): PayoutDetails | string {
	const accountHolder = String(formData.get('accountHolder') ?? '').trim();
	const sortCode = String(formData.get('sortCode') ?? '').replace(/\D/g, '');
	const accountNumber = String(formData.get('accountNumber') ?? '').replace(/\D/g, '');
	if (accountHolder === '') return 'The account holder name is required.';
	if (sortCode.length !== 6) return 'A UK sort code is six digits.';
	if (accountNumber.length !== 8) return 'A UK account number is eight digits.';
	return { accountHolder, sortCode, accountNumber };
}
