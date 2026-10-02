import { Marked, type MarkedExtension, type Token, type Tokens } from 'marked';

// Renders markdown to HTML without needing DOMPurify (whose server build,
// isomorphic-dompurify, drags jsdom into the Vercel bundle and crashes SSR).
// Safety comes from never emitting raw HTML: authored HTML is escaped to text,
// and only links/images with safe protocols render as elements.

const safeHrefPattern = /^(?:https?:|mailto:|tel:|[./#])/i;

/** The modeller cross-references pages as `[Title](/domain-brain/slug)`. */
const modellerPageLinkPattern = /^\/domain-brain\/([a-z0-9-]+)$/;

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

const safeRendering: MarkedExtension = {
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
};

const markdown = new Marked(safeRendering);

export function renderMarkdown(source: string): string {
	return markdown.parse(source, { async: false }) as string;
}

/** Renders with the modeller's page links pointed wherever the caller reads pages. */
export function renderMarkdownWithin(
	source: string,
	pageHrefFor: (slug: string) => string
): string {
	const rewritingMarkdown = new Marked(safeRendering, {
		walkTokens(token: Token) {
			if (token.type !== 'link') return;
			token.href = rewriteModellerPageLink(token.href, pageHrefFor);
		}
	});
	return rewritingMarkdown.parse(source, { async: false }) as string;
}

export function rewriteModellerPageLink(
	href: string,
	pageHrefFor: (slug: string) => string
): string {
	const match = modellerPageLinkPattern.exec(href.trim());
	if (match === null) return href;
	return pageHrefFor(match[1]);
}
