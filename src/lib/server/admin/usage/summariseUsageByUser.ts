import { classifyLedgerMovement, type LedgerMovementKind } from './classifyLedgerMovement';
import { creditValuePence } from '$lib/data/creditPacks';
import type { LedgerMovement } from './getLedgerMovements';
import type { ModelUsageRow } from './getModelUsageRows';

export type UserUsageSummary = {
	userId: string;
	email: string;
	creditsBought: number;
	creditsGranted: number;
	creditsSpent: number;
	creditsRefunded: number;
	balance: number;
	costPence: number;
	revenuePence: number;
	marginPence: number;
};

const unknownEmail = '(deleted account)';

type CreditTally = 'creditsBought' | 'creditsGranted' | 'creditsSpent' | 'creditsRefunded';

const tallyFor: Record<LedgerMovementKind, { field: CreditTally; sign: 1 | -1 }> = {
	bought: { field: 'creditsBought', sign: 1 },
	granted: { field: 'creditsGranted', sign: 1 },
	refunded: { field: 'creditsRefunded', sign: 1 },
	spent: { field: 'creditsSpent', sign: -1 }
};

// Credits move in the window; the balance is all-time; revenue values the
// credits a user net-spent at what the business sold them for, so the
// margin is what those credits earned against what Claude cost.
export function summariseUsageByUser(
	emails: Map<string, string>,
	movements: LedgerMovement[],
	usageRows: ModelUsageRow[],
	since: Date
): UserUsageSummary[] {
	const summaries = new Map<string, UserUsageSummary>();
	const summaryFor = (userId: string) => {
		const existing = summaries.get(userId);
		if (existing !== undefined) return existing;
		const created = emptySummary(userId, emails.get(userId) ?? unknownEmail);
		summaries.set(userId, created);
		return created;
	};
	movements.forEach((movement) => addMovement(summaryFor(movement.userId), movement, since));
	usageRows.forEach((row) => (summaryFor(row.userId).costPence += row.costPence));
	return [...summaries.values()]
		.map(withRevenueAndMargin)
		.sort((first, second) => second.costPence - first.costPence);
}

function addMovement(summary: UserUsageSummary, movement: LedgerMovement, since: Date): void {
	summary.balance += movement.delta;
	if (movement.createdAt < since) return;
	const tally = tallyFor[classifyLedgerMovement(movement)];
	summary[tally.field] += tally.sign * movement.delta;
}

function withRevenueAndMargin(summary: UserUsageSummary): UserUsageSummary {
	const netCreditsSpent = summary.creditsSpent - summary.creditsRefunded;
	const revenuePence = netCreditsSpent * creditValuePence;
	return { ...summary, revenuePence, marginPence: revenuePence - summary.costPence };
}

function emptySummary(userId: string, email: string): UserUsageSummary {
	return {
		userId,
		email,
		creditsBought: 0,
		creditsGranted: 0,
		creditsSpent: 0,
		creditsRefunded: 0,
		balance: 0,
		costPence: 0,
		revenuePence: 0,
		marginPence: 0
	};
}
