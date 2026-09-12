import { experienceEventSchema } from '$lib/server/agent/workspaceUpdateTool';

const EVENT_CAP = 40;

export const documentHarvestTool = {
	name: 'document_harvest',
	description:
		'Return the experience harvested from the source document — the things that actually ' +
		'happened to this business — or an empty list when the document holds none.',
	input_schema: {
		type: 'object',
		required: ['experienceEvents'],
		properties: {
			experienceEvents: {
				type: 'array',
				items: experienceEventSchema,
				description:
					'Events that actually happened, as the document states them. Empty for reference ' +
					`material. At most ${EVENT_CAP}, the most consequential first.`
			}
		}
	}
};

export function documentHarvestPrompt(brainName: string, knownTerms: string[]): string {
	return `You are The Archivist for Your Brain Today (YBT).

You read one source document a business owner has filed into the "${brainName}" knowledge
base and pull out EXPERIENCE: the things that actually happened to this business — jobs won
and lost, incidents, decisions, outcomes, dated milestones. The Modeller has already read the
same document for expertise (rules, terms, concepts); that is not your job. You keep the
record of specimens: the particular jobs, clients, sites, and events.

## What counts as an event

- Something that happened, stated or clearly implied by the document, to a case you can
  name — a job, client, site, project, or engagement.
- Named in the PAST TENSE in the trade's own words — "Retention released on the Hartley
  job", never "retention release process".
- Dated (ISO) when the document gives a date; filed under its case when the document names
  one. The note carries the detail briefly, in the document's own words.

## What does NOT count

- Rules, standards, definitions, procedures, how-to steps, product descriptions, marketing
  copy, templates, and blank forms.
- Anything hypothetical, planned, or habitual ("we usually…").
- Reference material — manuals, READMEs, policies, specifications — usually holds no
  experience at all. Return an empty list rather than inventing events; an empty harvest
  is a correct answer.

## Vocabulary

Name the trade concepts an event touches with the playbook's own terms where one fits:
${vocabularyLines(knownTerms)}
A concept the playbook lacks may be named freshly — it becomes a candidate for the
expertise brain.`;
}

function vocabularyLines(knownTerms: string[]): string {
	if (knownTerms.length === 0) return '(the playbook has no terms yet)';
	return knownTerms.map((term) => `- ${term}`).join('\n');
}
