export type BrainListing = {
	id: string;
	brainId: string;
	ownerId: string;
	ownerName: string;
	headline: string;
	description: string;
	editionPriceCredits: number | null;
	subscriptionPriceCredits: number | null;
	isPublished: boolean;
	createdAt: string;
};

export type BrainEdition = {
	id: string;
	listingId: string;
	snapshotBrainId: string;
	name: string;
	version: number;
	publishedAt: string;
};

export type PurchaseKind = 'edition' | 'subscription';

export type SubscriptionStatus = 'active' | 'cancelled';

export type PurchasedEdition = {
	purchaseId: string;
	headline: string;
	editionName: string;
	editionVersion: number;
	priceCredits: number;
	purchasedAt: string;
	brainId: string;
	entityId: string;
};

export type BrainSubscription = {
	purchaseId: string;
	listingId: string;
	headline: string;
	priceCredits: number;
	currentPeriodEnd: string;
	status: SubscriptionStatus;
	brainId: string;
	entityId: string;
};

export type ListingSales = {
	editionSaleCount: number;
	activeSubscriberCount: number;
};

export type BrainAccessRole = 'owner' | 'collaborator' | 'reader';
