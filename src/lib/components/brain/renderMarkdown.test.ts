import { describe, expect, it } from 'vitest';
import { renderMarkdown, renderMarkdownWithin, rewriteModellerPageLink } from './renderMarkdown';

const readerHrefFor = (slug: string) => `/reader/${slug}`;

describe('renderMarkdownWithin', () => {
	it('points the modeller page links at the reader', () => {
		const html = renderMarkdownWithin('See [Orders](/domain-brain/orders).', readerHrefFor);
		expect(html).toContain('href="/reader/orders"');
		expect(html).toContain('>Orders</a>');
	});

	it('leaves every other link alone', () => {
		const html = renderMarkdownWithin('See [Docs](https://example.com/x).', readerHrefFor);
		expect(html).toContain('href="https://example.com/x"');
	});

	it('does not touch the plain renderer', () => {
		expect(renderMarkdown('[Orders](/domain-brain/orders)')).toContain(
			'href="/domain-brain/orders"'
		);
	});
});

describe('rewriteModellerPageLink', () => {
	it('rewrites only exact modeller page paths', () => {
		expect(rewriteModellerPageLink('/domain-brain/order-line', readerHrefFor)).toBe(
			'/reader/order-line'
		);
		expect(rewriteModellerPageLink('/domain-brain/order-line/extra', readerHrefFor)).toBe(
			'/domain-brain/order-line/extra'
		);
		expect(rewriteModellerPageLink('#top', readerHrefFor)).toBe('#top');
	});
});
