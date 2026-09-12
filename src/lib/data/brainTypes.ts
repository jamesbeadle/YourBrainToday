export type BrainSourceStatus = 'uploaded' | 'ingested' | 'failed' | 'proposed' | 'rejected';

export type BrainSource = {
	id: string;
	filename: string;
	mimeType: string;
	byteCount: number;
	status: BrainSourceStatus;
	summary: string;
	createdAt: string;
};

export type DomainBlockKind =
	| 'entity'
	| 'value_object'
	| 'aggregate'
	| 'domain_service'
	| 'domain_event'
	| 'glossary'
	| 'context_map';

export type BrainContext = {
	slug: string;
	name: string;
	summary: string;
	isCoreDomain: boolean;
};

export type BrainPageSummary = {
	slug: string;
	title: string;
	summary: string;
	kind: DomainBlockKind;
	contextSlug: string | null;
};

export type BrainPage = BrainPageSummary & {
	body: string;
	updatedAt: string;
};

export type BrainPageLink = { fromSlug: string; toSlug: string };

export type BrainEventKind =
	| 'source_ingested'
	| 'source_removed'
	| 'context_created'
	| 'context_updated'
	| 'context_deleted'
	| 'page_created'
	| 'page_updated'
	| 'page_deleted'
	| 'question_answered'
	| 'brain_exported'
	| 'changes_proposed'
	| 'changes_approved'
	| 'changes_rejected'
	| 'edition_published'
	| 'model_pruned';

export type BrainEvent = {
	id: number;
	kind: BrainEventKind;
	detail: Record<string, unknown>;
	pageSlug: string | null;
	createdAt: string;
};

export type BrainAnswer = {
	answerMarkdown: string;
	citedSlugs: string[];
};

export type BrainConversationChannel = 'brain' | 'face' | 'api';

export type BrainSpeaker = 'user' | 'modeller';

export type BrainConversationTurn = { speaker: BrainSpeaker; text: string };

export type BrainConversationMessage = {
	id: number;
	speaker: BrainSpeaker;
	body: string;
	citedSlugs: string[];
	createdAt: string;
};

export type BrainConversationThread = {
	conversationId: string | null;
	messages: BrainConversationMessage[];
};
