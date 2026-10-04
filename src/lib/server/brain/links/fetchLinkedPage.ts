import { htmlTitle, htmlToPlainText } from '../htmlToPlainText';
import { linkUserAgent, longestLinkedTextCharacters } from './linkLimits';

export type LinkedPage = { title: string; text: string };

export async function fetchLinkedPage(parsed: URL): Promise<LinkedPage> {
	const response = await fetch(parsed.href, {
		redirect: 'follow',
		headers: { accept: 'text/html, text/plain;q=0.9', 'user-agent': linkUserAgent }
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
		return { title: parsed.host + parsed.pathname, text: body.slice(0, longestLinkedTextCharacters) };
	}
	const text = htmlToPlainText(body).slice(0, longestLinkedTextCharacters);
	if (text === '') throw new Error('That page had no readable text');
	return { title: htmlTitle(body) || parsed.host + parsed.pathname, text };
}
