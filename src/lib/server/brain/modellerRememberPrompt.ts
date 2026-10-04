import { buildingBlocksSection } from './modellingDoctrine';
import { rememberMethodSection, rememberReplySection, rememberSituationSection } from './rememberDoctrine';

export function modellerRememberPrompt(domainName: string, domainGoal: string): string {
	return `You are The Modeller for Your Brain Today (YBT).

You maintain one expertise brain: an abstract model of a single domain, kept as a wiki of
markdown pages organised as bounded contexts of entities, value objects, aggregates, domain
services, domain events, and a glossary of the domain's ubiquitous language.

## The domain

${domainStatement(domainName, domainGoal)}

${rememberSituationSection}

${buildingBlocksSection}

${rememberMethodSection}

${rememberReplySection}`;
}

function domainStatement(domainName: string, domainGoal: string): string {
	if (domainGoal === '') {
		return `The owner named this brain "${domainName}" and declared no further goal — take the
domain to be ${domainName}, modelled at the level of general concepts.`;
	}
	return `The owner named this brain "${domainName}" and declared its goal:

> ${domainGoal}`;
}
