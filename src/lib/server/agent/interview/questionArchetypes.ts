import type { Gap } from './gapTypes';

export function questionArchetypeFor(gap: Gap): string {
	if (gap.kind === 'UnnamedBusiness') return 'What does the business do, and for whom?';
	if (gap.kind === 'NoExternalInputs') {
		return 'What arrives from the outside world that starts work off?';
	}
	if (gap.kind === 'LonelyRole') {
		return `What else does ${gap.roleName} handle in a normal week?`;
	}
	if (gap.kind === 'BareTask') {
		return `Walk me through ${gap.taskName} — what must exist before it starts? What comes out?`;
	}
	if (gap.kind === 'OrphanInput') {
		return `${gap.taskName} needs ${gap.inputName} — where does that come from?`;
	}
	if (gap.kind === 'DeadEndOutput') {
		return `${gap.taskName} produces ${gap.outputName} — who picks that up next?`;
	}
	if (gap.kind === 'SilentInterchange') {
		return `When ${gap.roleName} hands work from ${gap.taskName} to ${gap.toRole}, what goes wrong or gets delayed?`;
	}
	if (gap.kind === 'BrokenJourney') {
		return `I can't trace ${gap.businessOutput} back to where it starts — what am I missing?`;
	}
	return `I've marked ${gap.taskName} under ${gap.roleName} as my own inference — did I get that right?`;
}
