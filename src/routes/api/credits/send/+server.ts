import { error, json } from '@sveltejs/kit';
import { resolveAccountByEmail } from '$lib/server/sharing/resolveAccountByEmail';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, request }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to send credits');

	const payload = await request.json();
	const email = typeof payload.email === 'string' ? payload.email.trim() : '';
	const amount = Number(payload.amount);
	if (email === '') error(400, 'An email is required');
	if (!Number.isInteger(amount) || amount < 1) error(400, 'A whole number of credits is required');

	const recipient = await resolveAccountByEmail(locals.supabase, email);
	if (recipient === null) {
		error(404, 'No Your Brain Today account has that email — your credits were not sent');
	}
	if (recipient.id === user.id) error(400, 'That is your own account');

	const { data, error: sendFailure } = await locals.supabase.rpc('send_credits', {
		recipient: recipient.id,
		credit_amount: amount
	});
	if (sendFailure !== null) return failFrom(sendFailure.message);
	return json({ creditBalance: data, recipientEmail: recipient.email });
};

function failFrom(message: string): never {
	if (message.includes('insufficient_credits')) error(402, 'You are out of credits');
	if (message.includes('account_restricted')) error(403, 'This account is currently restricted');
	if (message.includes('invalid_amount')) error(400, 'Between 1 and 100,000 credits per send');
	error(500, 'The credits could not be sent — nothing was taken');
}
