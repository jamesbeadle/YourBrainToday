import { hiveMindEarningsPool } from '$lib/data/creditPricing';

export type HiveEarningsShare = {
	memberId: string;
	pagesRead: number;
	creditsAwarded: number;
};

export function splitHiveMindEarnings(pagesReadCounts: Map<string, number>): HiveEarningsShare[] {
	const contributions = [...pagesReadCounts.entries()].filter(([, pagesRead]) => pagesRead > 0);
	const totalPagesRead = contributions.reduce((total, [, pagesRead]) => total + pagesRead, 0);
	if (totalPagesRead === 0) return [];
	const shares = contributions.map(([memberId, pagesRead]) => ({
		memberId,
		pagesRead,
		creditsAwarded: Math.floor((hiveMindEarningsPool * pagesRead) / totalPagesRead)
	}));
	awardRemainderToLargest(shares);
	return shares;
}

function awardRemainderToLargest(shares: HiveEarningsShare[]): void {
	const awarded = shares.reduce((total, share) => total + share.creditsAwarded, 0);
	const remainder = hiveMindEarningsPool - awarded;
	if (remainder <= 0) return;
	const largest = shares.reduce((leading, share) =>
		share.pagesRead > leading.pagesRead ? share : leading
	);
	largest.creditsAwarded += remainder;
}
