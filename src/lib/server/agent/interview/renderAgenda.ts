import { questionArchetypeFor } from './questionArchetypes';
import type { Gap, InterviewState } from './gapTypes';

const alternateGapCount = 2;

export function renderAgenda(state: InterviewState): string {
	if (state.rankedGaps.length === 0) return completeAgenda();
	const [topGap, ...remainingGaps] = state.rankedGaps;
	const alternates = remainingGaps.slice(0, alternateGapCount);
	return [
		'## Interview agenda',
		'',
		`Current phase: **${state.phase}**.`,
		'',
		`Your target: ${describeGap(topGap)}`,
		`Question archetype: "${questionArchetypeFor(topGap)}"`,
		...alternateLines(alternates),
		'',
		'The archetype is a target, not a script — phrase it in the owner’s own vocabulary.',
		'If the owner’s answer opens a richer seam (a new role, a war story about a handover),',
		'follow the energy and capture everything said; the agenda self-corrects next turn.'
	].join('\n');
}

function alternateLines(alternates: Gap[]): string[] {
	if (alternates.length === 0) return [];
	return [
		'',
		'If the conversation is already closer to one of these, take it instead:',
		...alternates.map((gap) => `- ${describeGap(gap)} ("${questionArchetypeFor(gap)}")`)
	];
}

function describeGap(gap: Gap): string {
	const details = Object.entries(gap)
		.filter(([key]) => key !== 'kind')
		.map(([, value]) => value)
		.join(', ');
	if (details === '') return gap.kind;
	return `${gap.kind} (${details})`;
}

function completeAgenda(): string {
	return [
		'## Interview agenda',
		'',
		'The map is complete — every axiom holds.',
		'Invite the owner to correct anything that looks wrong, or to go deeper on any role.'
	].join('\n');
}
