import type { EmailDelivery } from '$lib/data/emailDelivery';
import type { ShareScope } from '$lib/data/sharingTypes';

export type ShareOutcome =
	| { isShared: true; emailDelivery: EmailDelivery }
	| { isShared: false; message: string };

export async function requestShare(
	email: string,
	scope: ShareScope,
	brainId: string,
	entityId: string
): Promise<ShareOutcome> {
	const response = await fetch('/api/workspace/shares', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			email,
			brainId: scope === 'brain' ? brainId : '',
			entityId: scope === 'entity' ? entityId : ''
		})
	});
	if (response.ok) return { isShared: true, emailDelivery: await deliveryFrom(response) };
	return { isShared: false, message: await messageFrom(response) };
}

async function deliveryFrom(response: Response): Promise<EmailDelivery> {
	const payload = await response.json().catch(() => null);
	return payload?.emailDelivery ?? 'sent';
}

async function messageFrom(response: Response): Promise<string> {
	const payload = await response.json().catch(() => null);
	return payload?.message ?? 'Sharing went wrong — try again.';
}
