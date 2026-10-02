// A citation is kept only when the page is one the model truly read in the
// exchange or one the index names, so an answer can never cite a page that
// was invented for it.
export function keepCitablePageKeys(citedKeys: string[], citableKeys: Iterable<string>): string[] {
	const citable = new Set(citableKeys);
	return [...new Set(citedKeys.filter((key) => citable.has(key)))];
}
