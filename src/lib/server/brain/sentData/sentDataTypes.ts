import type { BrainSourceArrival } from '$lib/data/brainSourceTypes';

export type SentData = { title: string; text: string };

export type SentDataOrigin = Exclude<BrainSourceArrival, 'upload'>;

export type SentDataOutcome =
	| { status: 'ingested'; sourceId: string; summary: string; creditBalance: number | null }
	| { status: 'rejected'; message: string }
	| { status: 'out_of_credits' }
	| { status: 'account_restricted' }
	| { status: 'failed'; message: string };
