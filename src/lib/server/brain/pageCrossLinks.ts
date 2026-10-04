const crossLinkPattern = /\]\(\/domain-brain\/([a-z0-9-]+)\)/g;

/** The slugs a page's body links to, each once, never the page itself. */
export function linkedSlugsFrom(fromSlug: string, body: string): string[] {
	const targets = [...body.matchAll(crossLinkPattern)].map((match) => match[1]);
	return [...new Set(targets)].filter((target) => target !== fromSlug);
}
