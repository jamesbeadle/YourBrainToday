import { renderChatbotExperience } from './renderChatbotExperience';
import { renderChatbotIndex } from './renderChatbotIndex';
import { renderChatbotPeople } from './renderChatbotPeople';
import { renderChatbotProcess } from './renderChatbotProcess';
import type { ChatbotKnowledge } from './getChatbotKnowledge';

export function renderChatbotKnowledge(knowledge: ChatbotKnowledge): string {
	return [
		'## Expertise — the domain model (read its pages with read_pages)',
		renderChatbotIndex(knowledge.brains),
		'## Experience — what has actually happened (already in front of you)',
		renderChatbotExperience(knowledge.experience),
		'## Process — how the work flows between roles (already in front of you)',
		renderChatbotProcess(knowledge.processMaps),
		'## Human — the people around the business and how they get on (already in front of you)',
		renderChatbotPeople(knowledge.people)
	].join('\n\n');
}
