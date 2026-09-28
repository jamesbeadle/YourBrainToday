import { refundCredits } from './spendCredits';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';

// The reserve was a guess from the file size. Once the true length is known the
// payer gets the surplus back, or pays the shortfall through the service-role
// settle_credits_for, which has no balance check: the transcript already exists.
export async function settleTranscriptionCredits(
	payerId: string,
	reservedCredits: number,
	owedCredits: number,
	reason: string
): Promise<void> {
	if (owedCredits === reservedCredits) return;
	if (owedCredits < reservedCredits) {
		return refundCredits(payerId, reservedCredits - owedCredits, reason);
	}
	const { error } = await supabaseServiceClient().rpc('settle_credits_for', {
		payer: payerId,
		credit_amount: owedCredits - reservedCredits,
		settle_reason: `${reason}_usage`
	});
	if (error !== null) console.error('Transcription settlement failed', reason, error);
}
