import type { BrainPageLink, BrainPageSummary } from '$lib/data/brainTypes';

export type PageNeighbours = {
	linkedFrom: BrainPageSummary[];
	linksTo: BrainPageSummary[];
	siblings: BrainPageSummary[];
	previous: BrainPageSummary | null;
	next: BrainPageSummary | null;
};

/** What stands around a page: who links to it, where it links, and its context read in title order. */
export function pageNeighboursOf(
	slug: string,
	contextSlug: string | null,
	pageIndex: BrainPageSummary[],
	pageLinks: BrainPageLink[]
): PageNeighbours {
	const bySlug = new Map(pageIndex.map((page) => [page.slug, page]));
	const contextPages = pageIndex
		.filter((page) => page.contextSlug === contextSlug)
		.toSorted((first, second) => first.title.localeCompare(second.title));
	const position = contextPages.findIndex((page) => page.slug === slug);
	return {
		linkedFrom: pagesFor(bySlug, pageLinks.filter((link) => link.toSlug === slug).map((link) => link.fromSlug)),
		linksTo: pagesFor(bySlug, pageLinks.filter((link) => link.fromSlug === slug).map((link) => link.toSlug)),
		siblings: contextPages.filter((page) => page.slug !== slug),
		previous: position > 0 ? contextPages[position - 1] : null,
		next: position >= 0 ? (contextPages[position + 1] ?? null) : null
	};
}

function pagesFor(bySlug: Map<string, BrainPageSummary>, slugs: string[]): BrainPageSummary[] {
	return slugs
		.flatMap((slug) => bySlug.get(slug) ?? [])
		.toSorted((first, second) => first.title.localeCompare(second.title));
}
