import { describe, expect, it } from 'vitest';
import { recogniseLink } from './linkTargets';

describe('recogniseLink', () => {
	it('reads a repository home page', () => {
		expect(recogniseLink(new URL('https://github.com/sveltejs/svelte'))).toEqual({
			kind: 'githubRepository',
			owner: 'sveltejs',
			name: 'svelte',
			branch: null,
			folder: ''
		});
	});

	it('reads a folder on a branch', () => {
		expect(recogniseLink(new URL('https://github.com/a/b/tree/main/src/lib'))).toEqual({
			kind: 'githubRepository',
			owner: 'a',
			name: 'b',
			branch: 'main',
			folder: 'src/lib'
		});
	});

	it('reads a single file', () => {
		expect(recogniseLink(new URL('https://github.com/a/b/blob/dev/README.md'))).toEqual({
			kind: 'githubFile',
			owner: 'a',
			name: 'b',
			branch: 'dev',
			path: 'README.md'
		});
	});

	it('treats other GitHub pages as web pages', () => {
		expect(recogniseLink(new URL('https://github.com/a/b/issues/4')).kind).toBe('webPage');
		expect(recogniseLink(new URL('https://github.com/features')).kind).toBe('webPage');
	});

	it('reads an X post on either host', () => {
		expect(recogniseLink(new URL('https://x.com/someone/status/123?s=20'))).toEqual({
			kind: 'xPost',
			handle: 'someone',
			postId: '123'
		});
		expect(recogniseLink(new URL('https://twitter.com/someone/status/123'))).toEqual({
			kind: 'xPost',
			handle: 'someone',
			postId: '123'
		});
	});

	it('reads an X profile but not the app pages', () => {
		expect(recogniseLink(new URL('https://x.com/someone'))).toEqual({
			kind: 'xProfile',
			handle: 'someone'
		});
		expect(recogniseLink(new URL('https://x.com/home')).kind).toBe('webPage');
	});

	it('leaves everything else as a web page', () => {
		expect(recogniseLink(new URL('https://example.com/blog/post')).kind).toBe('webPage');
	});
});
