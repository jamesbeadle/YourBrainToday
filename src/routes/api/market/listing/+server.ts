import { error, json } from '@sveltejs/kit';
import { getDisplayName } from '$lib/server/auth/getDisplayName';
import { getDomainBrain } from '$lib/server/entities/getDomainBrain';
import { getListingForBrain } from '$lib/server/market/getBrainListing';
import { setListingPublished, upsertBrainListing } from '$lib/server/market/saveBrainListing';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, request }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to sell your expertise brain');

	const payload = await request.json();
	const brainId = readText(payload.brainId);
	const headline = readText(payload.headline);
	if (brainId === '') error(400, 'A expertise brain is required');
	if (headline === '') error(400, 'A listing needs a headline');

	const brain = await getDomainBrain(locals.supabase, brainId);
	if (brain === null || brain.ownerId !== user.id) {
		error(403, 'Only the owner can sell this expertise brain');
	}

	const editionPrice = readPrice(payload.editionPriceCredits);
	const subscriptionPrice = readPrice(payload.subscriptionPriceCredits);
	if (editionPrice === null && subscriptionPrice === null) {
		error(400, 'Set a price for editions, a subscription, or both');
	}
	await upsertBrainListing(locals.supabase, {
		brainId,
		ownerEmail: user.email ?? '',
		ownerName: await getDisplayName(locals.supabase),
		headline,
		description: readText(payload.description),
		editionPriceCredits: editionPrice,
		subscriptionPriceCredits: subscriptionPrice
	});
	return json({ isSaved: true });
};

export const PATCH: RequestHandler = async ({ locals, request }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to manage your listing');

	const payload = await request.json();
	const brainId = readText(payload.brainId);
	const listing = await getListingForBrain(locals.supabase, brainId);
	if (listing === null) error(404, 'This expertise brain has no listing yet');

	const brain = await getDomainBrain(locals.supabase, brainId);
	if (brain === null || brain.ownerId !== user.id) {
		error(403, 'Only the owner can manage this listing');
	}
	await setListingPublished(locals.supabase, listing.id, payload.isPublished === true);
	return json({ isSaved: true });
};

function readText(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

function readPrice(value: unknown): number | null {
	const price = Number(value);
	if (!Number.isInteger(price) || price < 1) return null;
	return price;
}
