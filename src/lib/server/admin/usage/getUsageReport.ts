import { getLedgerMovements } from './getLedgerMovements';
import { getModelUsageRows } from './getModelUsageRows';
import { getProfileEmails } from './getProfileEmails';
import { summariseUsageByModel, type ModelUsageSummary } from './summariseUsageByModel';
import { summariseUsageByUser, type UserUsageSummary } from './summariseUsageByUser';
import { summariseUsageTotals, type UsageTotals } from './summariseUsageTotals';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { usageWindowStart, type UsageWindowDays } from '$lib/data/usageWindow';

export type UsageReport = {
	windowDays: UsageWindowDays;
	totals: UsageTotals;
	users: UserUsageSummary[];
	models: ModelUsageSummary[];
};

// Reads run on the service role because the ledger and usage tables belong
// to every user at once; the route has already required an admin.
export async function getUsageReport(windowDays: UsageWindowDays): Promise<UsageReport> {
	const service = supabaseServiceClient();
	const since = usageWindowStart(windowDays);
	const [emails, movements, usageRows] = await Promise.all([
		getProfileEmails(service),
		getLedgerMovements(service),
		getModelUsageRows(service, since)
	]);
	const users = summariseUsageByUser(emails, movements, usageRows, since);
	return {
		windowDays,
		totals: summariseUsageTotals(users, usageRows),
		users,
		models: summariseUsageByModel(usageRows)
	};
}
