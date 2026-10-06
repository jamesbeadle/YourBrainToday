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
