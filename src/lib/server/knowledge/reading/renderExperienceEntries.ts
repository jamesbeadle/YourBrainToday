import { clipPromptSection, clipPromptText } from './clipPromptText';
import { formatBritishDate } from '$lib/data/britishDate';
import { knowledgeReadingCaps } from '$lib/data/knowledge/knowledgeReadingCaps';
import type { ExperienceEntry } from './readExperienceEntries';

const { mostExperienceItems, longestExperienceEntry, longestExperienceSection } = knowledgeReadingCaps;

const undatedLabel = 'undated';
const truncationNote = '(Earlier entries are not shown.)';

export function renderExperienceEntries(items: ExperienceEntry[]): string {
	if (items.length === 0) return 'The experience brain has no entries yet.';
	const intro = `The ${items.length} most recent entries (${mostExperienceItems} at most), newest first:`;
	const entries = items.map(renderEntry).join('\n');
	return `${intro}\n${clipPromptSection(entries, longestExperienceSection, truncationNote)}`;
}

function renderEntry(item: ExperienceEntry): string {
	const when = item.occurredAt === null ? undatedLabel : formatBritishDate(item.occurredAt);
	const source = item.brainName === '' ? '' : ` (${item.brainName})`;
	return `- ${when} · ${item.title}${source}: ${clipPromptText(item.body, longestExperienceEntry)}`;
}
