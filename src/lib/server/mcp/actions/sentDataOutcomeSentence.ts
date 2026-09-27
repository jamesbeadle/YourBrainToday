import type { SentDataOutcome } from '$lib/server/brain/sentData/sentDataTypes';

export function describeSentDataOutcome(outcome: SentDataOutcome): string {
	if (outcome.status === 'rejected') return outcome.message;
	if (outcome.status === 'failed') return outcome.message;
	if (outcome.status === 'out_of_credits') {
		return 'You are out of credits — top up on the site, then send it again.';
	}
	if (outcome.status === 'account_restricted') return 'This account is currently restricted.';
	return [
		'The brain has learned it; it now appears in the ingested data.',
		outcome.summary === '' ? '' : `What it took from it: ${outcome.summary}`
	]
		.filter((line) => line !== '')
		.join('\n');
}
