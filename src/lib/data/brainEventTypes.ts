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
