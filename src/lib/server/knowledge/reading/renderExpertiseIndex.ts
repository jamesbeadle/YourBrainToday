import { clipPromptSection } from './clipPromptText';
import { renderDomainModelIndex } from '../../brain/getBrainPageIndex';
import { knowledgeReadingCaps } from '$lib/data/knowledge/knowledgeReadingCaps';
import type { ExpertiseBrainModel } from './readExpertiseBrains';

const { longestExpertiseIndex } = knowledgeReadingCaps;

const truncationNote = '(The rest of the expertise index is not shown.)';

export function renderExpertiseIndex(brains: ExpertiseBrainModel[]): string {
	if (brains.length === 0) return 'The knowledge base has no expertise brains yet.';
	const rendered = brains.map(renderBrain).join('\n\n');
	return clipPromptSection(rendered, longestExpertiseIndex, truncationNote);
}

function renderBrain(brain: ExpertiseBrainModel): string {
	const keyedPages = brain.pages.map((page) => ({ ...page, slug: `${brain.handle}/${page.slug}` }));
	const header = `## Brain: ${brain.name} [${brain.handle}]\n${brain.description}`;
	return `${header}\n\n${renderDomainModelIndex(brain.contexts, keyedPages)}`;
}
