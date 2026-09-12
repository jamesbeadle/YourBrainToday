import { blockingKindsFor } from './derivePhase';
import type { Gap, InterviewPhase } from './gapTypes';
import type { Journey } from './traceJourneys';
import type { WorkflowModel } from '$lib/data/workflowModel';

const unknownRoleRank = 999;

export function rankGaps(
	model: WorkflowModel,
	phase: InterviewPhase,
	gaps: Gap[],
	journeys: Journey[]
): Gap[] {
	const phaseKinds = new Set(blockingKindsFor(phase));
	const taskNamesOnJourneys = new Set(journeys.flatMap((journey) => journey.taskNamesOnPath));
	const roleOrder = model.roles.map((role) => role.name);
	return [...gaps].sort(
		(first, second) =>
			rankOf(first, phaseKinds, taskNamesOnJourneys, roleOrder) -
			rankOf(second, phaseKinds, taskNamesOnJourneys, roleOrder)
	);
}

function rankOf(
	gap: Gap,
	phaseKinds: Set<string>,
	taskNamesOnJourneys: Set<string>,
	roleOrder: string[]
): number {
	const phaseRank = phaseKinds.has(gap.kind) ? 0 : 1;
	const journeyRank = isOnJourney(gap, taskNamesOnJourneys) ? 0 : 1;
	return phaseRank * 1_000_000 + journeyRank * 1_000 + roleRank(gap, roleOrder);
}

function isOnJourney(gap: Gap, taskNamesOnJourneys: Set<string>): boolean {
	if ('taskName' in gap) return taskNamesOnJourneys.has(gap.taskName);
	return gap.kind === 'BrokenJourney';
}

function roleRank(gap: Gap, roleOrder: string[]): number {
	if (!('roleName' in gap)) return 0;
	const roleIndex = roleOrder.indexOf(gap.roleName);
	return roleIndex === -1 ? unknownRoleRank : roleIndex;
}
