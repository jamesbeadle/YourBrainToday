import type { BrainCategory } from './knowledgeTypes';

export type KnowledgeKind = 'expertise' | 'experience' | 'process';

export type KnowledgeKindDefinition = {
	kind: KnowledgeKind;
	label: string;
	question: string;
	explainer: string;
	accent: string;
};

export const knowledgeKinds: KnowledgeKindDefinition[] = [
	{
		kind: 'expertise',
		label: 'Expertise',
		question: 'What do you know?',
		explainer:
			'The rules, language, and models of your trade — the knowledge that makes you good at what you do.',
		accent: '#9db6ff'
	},
	{
		kind: 'experience',
		label: 'Experience',
		question: 'What have you done?',
		explainer:
			'The record of every job, event, and decision — captured in the terms your expertise defines.',
		accent: '#8fe6bd'
	},
	{
		kind: 'process',
		label: 'Process',
		question: 'How do you work?',
		explainer:
			'How work moves through the business — every role, task, and handover, drawn as a map.',
		accent: '#ffc861'
	}
];

const kindByCategory: Record<BrainCategory, KnowledgeKind> = {
	domain: 'expertise',
	instance: 'experience'
};

export function findKnowledgeKind(kind: KnowledgeKind): KnowledgeKindDefinition {
	return knowledgeKinds.find((definition) => definition.kind === kind) ?? knowledgeKinds[0];
}

export function kindForCategory(category: BrainCategory): KnowledgeKindDefinition {
	return findKnowledgeKind(kindByCategory[category]);
}
