export type InterviewPhase =
	| 'foundation'
	| 'roles'
	| 'flow'
	| 'connection'
	| 'interchanges'
	| 'resolution'
	| 'complete';

export type Gap =
	| { kind: 'UnnamedBusiness' }
	| { kind: 'NoExternalInputs' }
	| { kind: 'LonelyRole'; roleName: string }
	| { kind: 'BareTask'; roleName: string; taskName: string }
	| { kind: 'OrphanInput'; roleName: string; taskName: string; inputName: string }
	| { kind: 'DeadEndOutput'; roleName: string; taskName: string; outputName: string }
	| { kind: 'SilentInterchange'; roleName: string; taskName: string; toRole: string }
	| { kind: 'BrokenJourney'; businessOutput: string }
	| { kind: 'InferredFact'; roleName: string; taskName: string };

export type GapKind = Gap['kind'];

export type InterviewState = {
	phase: InterviewPhase;
	rankedGaps: Gap[];
};
