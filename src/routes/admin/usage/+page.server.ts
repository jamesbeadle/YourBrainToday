import { getUsageReport } from '$lib/server/admin/usage/getUsageReport';
import { parseUsageWindow } from '$lib/data/usageWindow';
import { requireAdmin } from '$lib/server/admin/requireAdmin';
import type { PageServerLoad } from './$types';

const windowSearchParameter = 'days';

export const load: PageServerLoad = async ({ locals, url }) => {
	await requireAdmin(locals);
	const windowDays = parseUsageWindow(url.searchParams.get(windowSearchParameter));
	return { report: await getUsageReport(windowDays) };
};
