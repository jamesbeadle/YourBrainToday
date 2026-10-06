import type { Gap, GapKind } from './gapTypes';

type ArchetypeFor<Kind extends GapKind> = (gap: Extract<Gap, { kind: Kind }>) => string;

const archetypes: { [Kind in GapKind]: ArchetypeFor<Kind> } = {
	UnnamedBusiness: () => 'What does the business do, and for whom?',
	NoExternalInputs: () => 'What arrives from the outside world that starts work off?',
	LonelyRole: (gap) => `What else does ${gap.roleName} handle in a normal week?`,
	BareTask: (gap) =>
		`Walk me through ${gap.taskName} — what must exist before it starts? What comes out?`,
	OrphanInput: (gap) => `${gap.taskName} needs ${gap.inputName} — where does that come from?`,
	DeadEndOutput: (gap) => `${gap.taskName} produces ${gap.outputName} — who picks that up next?`,
	SilentInterchange: (gap) =>
		`When ${gap.roleName} hands work from ${gap.taskName} to ${gap.toRole}, what goes wrong or gets delayed?`,
	BrokenJourney: (gap) =>
		`I can't trace ${gap.businessOutput} back to where it starts — what am I missing?`,
	InferredFact: (gap) =>
		`I've marked ${gap.taskName} under ${gap.roleName} as my own inference — did I get that right?`
};

export function questionArchetypeFor(gap: Gap): string {
	const archetype = archetypes[gap.kind] as (gap: Gap) => string;
	return archetype(gap);
}
