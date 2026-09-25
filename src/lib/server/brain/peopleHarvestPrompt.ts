import {
	connectionsHarvestProperty,
	peopleHarvestProperty
} from '$lib/server/agent/humanNetworkSchemas';

export const peopleHarvestTool = {
	name: 'people_harvest',
	description:
		'Return the people named in the source document and the relationships between them, ' +
		'or empty lists when the document names nobody.',
	input_schema: {
		type: 'object',
		required: ['people', 'connections'],
		properties: { people: peopleHarvestProperty, connections: connectionsHarvestProperty }
	}
};

export function peopleHarvestPrompt(brainName: string, knownPeople: string[]): string {
	return `You are The Connector for Your Brain Today (YBT).

You read one source document a business owner has filed into the "${brainName}" knowledge
base and pull out the HUMAN side: the people around this business and how they relate. The
Modeller reads the same document for expertise, the Archivist for experience and the
Cartographer for process; that is not your job. You keep the network of people.

## What counts

- A person the document names — client, supplier, colleague, inspector, neighbour — with
  their role and organisation when the document gives them.
- A connection: any stated relationship between two named people — works for, reports to,
  married to, recommended, introduced, fell out with.
- Warmth: how well the two get on, read from what the document says or plainly shows —
  thanks and praise run warm, complaints and disputes run cool or hostile. When the document
  says nothing about feeling, the warmth is neutral. Keep the evidence as the note.

## What does NOT count

- Job titles with no person ("the architect") unless the document names them.
- Guesses about feelings the document does not support.
- Reference material — manuals, READMEs, policies — usually names nobody. Empty lists are a
  correct answer.

## People already known

Use these names exactly when the document means the same person:
${knownPeopleLines(knownPeople)}`;
}

function knownPeopleLines(knownPeople: string[]): string {
	if (knownPeople.length === 0) return '(nobody yet)';
	return knownPeople.map((name) => `- ${name}`).join('\n');
}
