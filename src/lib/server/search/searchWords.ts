export const mostSearchHits = 20;
const longestQuery = 200;

/** The words as Postgres is asked for them: trimmed, and never longer than a query may be. */
export function clipSearchWords(query: string): string {
	return query.trim().slice(0, longestQuery);
}

/** Postgres marks matches with <b> tags; the snippet is plain text everywhere it is shown. */
export function plainSnippet(snippet: string | null): string {
	return (snippet ?? '').replace(/<\/?b>/g, '').replace(/\s+/g, ' ').trim();
}
