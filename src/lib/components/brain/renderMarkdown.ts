import { Marked, type Tokens } from 'marked';

// Renders markdown to HTML without needing DOMPurify (whose server build,
// isomorphic-dompurify, drags jsdom into the Vercel bundle and crashes SSR).
// Safety comes from never emitting raw HTML: authored HTML is escaped to text,
// and only links/images with safe protocols render as elements.

const safeHrefPattern = /^(?:https?:|mailto:|tel:|[./#])/i;

function escapeHtml(raw: string): string {
	return raw
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function isSafeHref(href: string): boolean {
	return safeHrefPattern.test(href.trim());
}

const markdown = new Marked({
	renderer: {
		html(token: Tokens.HTML | Tokens.Generic): string {
			return escapeHtml(token.raw);
		},
		link(token: Tokens.Link): string | false {
			if (isSafeHref(token.href)) return false;
			return escapeHtml(token.text);
		},
		image(token: Tokens.Image): string | false {
			if (isSafeHref(token.href)) return false;
			return escapeHtml(token.text);
		}
	}
});

export function renderMarkdown(source: string): string {
	return markdown.parse(source, { async: false }) as string;
}
