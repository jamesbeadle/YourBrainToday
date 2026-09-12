import type { MintedBrainApiToken } from '$lib/data/brainApiTypes';

export type TokenCreateOutcome =
	| { isCreated: true; minted: MintedBrainApiToken }
	| { isCreated: false; message: string };

export async function requestTokenCreate(
	brainId: string,
	name: string
): Promise<TokenCreateOutcome> {
	const response = await fetch('/api/brain/tokens', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ brainId, name })
	});
	if (response.ok) return { isCreated: true, minted: await response.json() };
	return { isCreated: false, message: await messageFrom(response) };
}

export async function requestTokenRevoke(tokenId: string): Promise<void> {
	await fetch('/api/brain/tokens', {
		method: 'DELETE',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ tokenId })
	});
}

async function messageFrom(response: Response): Promise<string> {
	const payload = await response.json().catch(() => null);
	return payload?.message ?? 'That went wrong — try again.';
}
