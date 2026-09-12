export type BrainApiToken = {
	id: string;
	name: string;
	tokenHint: string;
	createdAt: string;
	lastUsedAt: string | null;
};

export type MintedBrainApiToken = BrainApiToken & { token: string };
