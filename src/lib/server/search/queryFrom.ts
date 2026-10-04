/** The words a search tool call asks for, or nothing when the model sent no query. */
export function queryFrom(input: unknown): string {
	if (typeof input !== 'object' || input === null) return '';
	const candidate = (input as { query?: unknown }).query;
	return typeof candidate === 'string' ? candidate : '';
}
