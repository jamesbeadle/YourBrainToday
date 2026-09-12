import { clipPromptSection, clipPromptText } from './clipPromptText';
import { formatBritishDate } from '$lib/data/britishDate';
import { chatbotKnowledgeCaps } from '$lib/data/chatbotKnowledgeCaps';
import type { ChatbotExperienceItem } from './getChatbotExperience';

const { mostExperienceItems, longestExperienceEntry, longestExperienceSection } = chatbotKnowledgeCaps;

const undatedLabel = 'undated';
const truncationNote = '(Earlier entries are not shown.)';

export function renderChatbotExperience(items: ChatbotExperienceItem[]): string {
	if (items.length === 0) return 'The experience brain has no entries yet.';
	const intro = `The ${items.length} most recent entries (${mostExperienceItems} at most), newest first:`;
	const entries = items.map(renderEntry).join('\n');
	return `${intro}\n${clipPromptSection(entries, longestExperienceSection, truncationNote)}`;
}

function renderEntry(item: ChatbotExperienceItem): string {
	const when = item.occurredAt === null ? undatedLabel : formatBritishDate(item.occurredAt);
	const source = item.brainName === '' ? '' : ` (${item.brainName})`;
	return `- ${when} · ${item.title}${source}: ${clipPromptText(item.body, longestExperienceEntry)}`;
}
