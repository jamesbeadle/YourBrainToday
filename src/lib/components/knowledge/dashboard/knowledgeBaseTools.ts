import { sectionIconPaths } from '../../brain/dashboard/railIcons';
import { knowledgeBaseToolParameter } from '$lib/data/knowledge/knowledgeBaseRoutes';

export type KnowledgeBaseToolKey =
	| 'interview'
	| 'documents'
	| 'review'
	| 'share'
	| 'chatbots'
	| 'api'
	| 'log'
	| 'settings';

export type KnowledgeBaseToolDefinition = {
	key: KnowledgeBaseToolKey;
	label: string;
	iconPaths: string[];
};

/** The constellation glyph: three brains on a ring, the rail's way to the knowledge base. */
export const brainsIconPaths = [
	'M12 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
	'M5 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
	'M19 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
	'M10.8 7.2 6.3 13.3',
	'M13.2 7.2l4.5 6.1',
	'M7 17.5h10',
	'M12 12.5h.01'
];

const chatbotIconPaths = [
	'M12 2v4',
	'M5 10a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z',
	'M9 13h.01M15 13h.01',
	'M2 13h3M19 13h3'
];

export const knowledgeBaseToolDefinitions: Record<KnowledgeBaseToolKey, KnowledgeBaseToolDefinition> = {
	interview: { key: 'interview', label: 'The interview', iconPaths: sectionIconPaths.interview },
	documents: { key: 'documents', label: 'Source documents', iconPaths: sectionIconPaths.sources },
	review: { key: 'review', label: 'Review changes', iconPaths: sectionIconPaths.review },
	share: { key: 'share', label: 'Sharing', iconPaths: sectionIconPaths.share },
	chatbots: { key: 'chatbots', label: 'Chatbots', iconPaths: chatbotIconPaths },
	api: { key: 'api', label: 'API access', iconPaths: sectionIconPaths.api },
	log: { key: 'log', label: 'The log', iconPaths: sectionIconPaths.log },
	settings: { key: 'settings', label: 'Settings', iconPaths: sectionIconPaths.settings }
};

const ownerToolKeys: KnowledgeBaseToolKey[] = [
	'interview',
	'documents',
	'review',
	'share',
	'chatbots',
	'api',
	'log',
	'settings'
];

const viewerToolKeys: KnowledgeBaseToolKey[] = ['interview', 'log'];

export type ExpertiseWorkbenchTool = 'documents' | 'review' | 'api' | 'log';

export function knowledgeBaseToolKeysFor(isOwner: boolean): KnowledgeBaseToolKey[] {
	return isOwner ? ownerToolKeys : viewerToolKeys;
}

/** A link may ask for a tool; otherwise a wide screen opens the interview and a phone opens nothing. */
export function openingKnowledgeBaseTool(
	url: URL,
	isOwner: boolean,
	isWideScreen: boolean
): KnowledgeBaseToolKey | null {
	const requested = url.searchParams.get(knowledgeBaseToolParameter);
	const requestedTool = knowledgeBaseToolKeysFor(isOwner).find((key) => key === requested);
	if (requestedTool !== undefined) return requestedTool;
	return isWideScreen ? 'interview' : null;
}
