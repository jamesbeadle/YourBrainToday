import type { HiveContributor, HiveMember } from '$lib/data/hiveTypes';
import type { HiveEarningsShare } from './splitHiveMindEarnings';

export function contributorsFrom(members: HiveMember[], shares: HiveEarningsShare[]): HiveContributor[] {
	return shares
		.map((share) => ({
			specialtyName: memberName(members, share.memberId),
			pagesRead: share.pagesRead
		}))
		.sort((first, second) => second.pagesRead - first.pagesRead);
}

function memberName(members: HiveMember[], memberId: string): string {
	return members.find((member) => member.id === memberId)?.specialtyName ?? 'A specialist';
}
