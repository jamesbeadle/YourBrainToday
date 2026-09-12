export type MarketRequestOutcome = { isSaved: true } | { isSaved: false; message: string };

export async function requestListingSave(
	brainId: string,
	draft: {
		headline: string;
		description: string;
		editionPriceCredits: string;
		subscriptionPriceCredits: string;
	}
): Promise<MarketRequestOutcome> {
	return sendMarketRequest('/api/market/listing', 'POST', { brainId, ...draft });
}

export async function requestListingPublish(
	brainId: string,
	isPublished: boolean
): Promise<MarketRequestOutcome> {
	return sendMarketRequest('/api/market/listing', 'PATCH', { brainId, isPublished });
}

export async function requestEditionPublish(
	brainId: string,
	name: string
): Promise<MarketRequestOutcome> {
	return sendMarketRequest('/api/market/editions', 'POST', { brainId, name });
}

async function sendMarketRequest(
	path: string,
	method: string,
	payload: Record<string, unknown>
): Promise<MarketRequestOutcome> {
	const response = await fetch(path, {
		method,
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(payload)
	});
	if (response.ok) return { isSaved: true };
	return { isSaved: false, message: await messageFrom(response) };
}

async function messageFrom(response: Response): Promise<string> {
	const payload = await response.json().catch(() => null);
	return payload?.message ?? 'That went wrong — try again.';
}
