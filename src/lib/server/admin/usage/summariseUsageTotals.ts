import type { ModelUsageRow } from './getModelUsageRows';
import type { UserUsageSummary } from './summariseUsageByUser';

export type UsageTotals = {
	callCount: number;
	costPence: number;
	revenuePence: number;
	marginPence: number;
	failedSettlementCallCount: number;
	failedSettlementCostPence: number;
};

export function summariseUsageTotals(
	users: UserUsageSummary[],
	usageRows: ModelUsageRow[]
): UsageTotals {
	const failedRows = usageRows.filter((row) => row.hasFailedSettlement);
	const revenuePence = sum(users.map((user) => user.revenuePence));
	const costPence = sum(usageRows.map((row) => row.costPence));
	return {
		callCount: usageRows.length,
		costPence,
		revenuePence,
		marginPence: revenuePence - costPence,
		failedSettlementCallCount: failedRows.length,
		failedSettlementCostPence: sum(failedRows.map((row) => row.costPence))
	};
}

function sum(values: number[]): number {
	return values.reduce((total, value) => total + value, 0);
}
