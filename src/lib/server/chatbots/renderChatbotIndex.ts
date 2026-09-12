import { clipPromptSection } from './clipPromptText';
import { renderDomainModelIndex } from '../brain/getBrainPageIndex';
import { chatbotKnowledgeCaps } from '$lib/data/chatbotKnowledgeCaps';
import type { ChatbotBrainModel } from './getChatbotBrains';

const { longestExpertiseIndex } = chatbotKnowledgeCaps;

const truncationNote = '(The rest of the expertise index is not shown.)';

export function renderChatbotIndex(brains: ChatbotBrainModel[]): string {
	if (brains.length === 0) return 'The knowledge base has no expertise brains yet.';
	const rendered = brains.map(renderBrain).join('\n\n');
	return clipPromptSection(rendered, longestExpertiseIndex, truncationNote);
}

function renderBrain(brain: ChatbotBrainModel): string {
	const keyedPages = brain.pages.map((page) => ({ ...page, slug: `${brain.handle}/${page.slug}` }));
	const header = `## Brain: ${brain.name} [${brain.handle}]\n${brain.description}`;
	return `${header}\n\n${renderDomainModelIndex(brain.contexts, keyedPages)}`;
}
