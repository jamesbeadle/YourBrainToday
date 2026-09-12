import { htmlTitle, htmlToPlainText } from './htmlToPlainText';

const longestPageCharacters = 200_000;
const blockedHostPattern = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[)/i;

export type LinkedPage = { title: string; text: string };

export async function fetchLinkedPage(pageUrl: string): Promise<LinkedPage> {
	const parsed = parsePageUrl(pageUrl);
	const response = await fetch(parsed.href, {
		redirect: 'follow',
		headers: { accept: 'text/html, text/plain;q=0.9', 'user-agent': 'YourBusinessToday/1.0' }
	});
	if (!response.ok) {
		throw new Error(`That page answered with status ${response.status}`);
	}
	const contentType = response.headers.get('content-type') ?? '';
	if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
		throw new Error('That link is not a readable page — only web pages can be ingested');
	}
	const body = await response.text();
	if (contentType.includes('text/plain')) {
		return { title: parsed.host + parsed.pathname, text: body.slice(0, longestPageCharacters) };
	}
	const text = htmlToPlainText(body).slice(0, longestPageCharacters);
	if (text === '') throw new Error('That page had no readable text');
	return { title: htmlTitle(body) || parsed.host + parsed.pathname, text };
}

function parsePageUrl(pageUrl: string): URL {
	let parsed: URL;
	try {
		parsed = new URL(pageUrl);
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
