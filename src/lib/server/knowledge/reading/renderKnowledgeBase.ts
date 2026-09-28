import { renderExperienceEntries } from './renderExperienceEntries';
import { renderExpertiseIndex } from './renderExpertiseIndex';
import { renderPeople } from './renderPeople';
import { renderProcessMaps } from './renderProcessMaps';
import { everyKnowledgeKind, type KnowledgeKind } from '$lib/data/knowledge/knowledgeKinds';
import type { KnowledgeBaseReading } from './readKnowledgeBase';

type SectionRenderer = (reading: KnowledgeBaseReading) => string;

const sectionRenderers: Record<KnowledgeKind, SectionRenderer> = {
	expertise: (reading) =>
		`## Expertise — the domain model (read its pages with read_pages)\n\n${renderExpertiseIndex(reading.expertise)}`,
	experience: (reading) =>
		`## Experience — what has actually happened (already in front of you)\n\n${renderExperienceEntries(reading.experience)}`,
	process: (reading) =>
		`## Process — how the work flows between roles (already in front of you)\n\n${renderProcessMaps(reading.processMaps)}`,
	human: (reading) =>
		`## Human — the people around the business and how they get on (already in front of you)\n\n${renderPeople(reading.people)}`
};

export function renderKnowledgeBase(reading: KnowledgeBaseReading): string {
	return everyKnowledgeKind
		.filter((kind) => reading.kinds.includes(kind))
		.map((kind) => sectionRenderers[kind](reading))
		.join('\n\n');
}
