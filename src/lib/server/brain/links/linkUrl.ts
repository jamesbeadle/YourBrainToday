const blockedHostPattern = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[)/i;

/** The link as a URL the server may fetch: http or https, and never one of our own private hosts. */
export function parseLinkUrl(link: string): URL {
	let parsed: URL;
	try {
		parsed = new URL(link.trim());
	} catch {
		throw new Error('That is not a valid link');
	}
	if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
		throw new Error('Only http and https links can be ingested');
	}
	if (blockedHostPattern.test(parsed.hostname)) {
		throw new Error('That host cannot be ingested');
	}
	return parsed;
}
