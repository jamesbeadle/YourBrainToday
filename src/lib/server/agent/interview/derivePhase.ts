import type { Gap, GapKind, InterviewPhase } from './gapTypes';
import type { WorkflowModel } from '$lib/data/workflowModel';

const blockingKindsByPhase: [InterviewPhase, GapKind[]][] = [
	['foundation', ['UnnamedBusiness', 'NoExternalInputs']],
	['roles', ['LonelyRole']],
	['flow', ['BareTask']],
	['connection', ['OrphanInput', 'DeadEndOutput', 'BrokenJourney']],
	['interchanges', ['SilentInterchange']],
	['resolution', ['InferredFact']]
];

export function derivePhase(model: WorkflowModel, gaps: Gap[]): InterviewPhase {
	if (model.roles.length === 0) return 'foundation';
	const presentKinds = new Set(gaps.map((gap) => gap.kind));
	const blockedPhase = blockingKindsByPhase.find(([, blockingKinds]) =>
		blockingKinds.some((blockingKind) => presentKinds.has(blockingKind))
	);
	if (blockedPhase === undefined) return 'complete';
	return blockedPhase[0];
}

export function blockingKindsFor(phase: InterviewPhase): GapKind[] {
	const entry = blockingKindsByPhase.find(([entryPhase]) => entryPhase === phase);
	return entry === undefined ? [] : entry[1];
}
