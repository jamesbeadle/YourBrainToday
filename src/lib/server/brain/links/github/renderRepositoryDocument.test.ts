import { describe, expect, it } from 'vitest';
import { renderRepositoryDocument } from './renderRepositoryDocument';

const facts = {
	fullName: 'acme/ledger',
	url: 'https://github.com/acme/ledger',
	description: 'Double-entry bookkeeping',
	language: 'TypeScript',
	topics: ['finance'],
	branch: 'main',
	folder: '',
	fileCount: 3
};

describe('renderRepositoryDocument', () => {
	it('opens with the repository facts, its source link and the files read', () => {
		const document = renderRepositoryDocument(
			facts,
			[{ path: 'README.md', size: 10, text: '# Ledger' }],
			2
		);
		expect(document).toContain('# acme/ledger — GitHub repository');
		expect(document).toContain('Source link: https://github.com/acme/ledger');
		expect(document).toContain('Primary language: TypeScript');
		expect(document).toContain('1 of 3 files in the repository were read.');
		expect(document).toContain('## Files read\n\n- README.md');
	});

	it('fences each file by its extension, widening the fence around markdown that has its own', () => {
		const document = renderRepositoryDocument(
			facts,
			[
				{ path: 'src/index.ts', size: 20, text: 'export const one = 1;' },
				{ path: 'docs/a.md', size: 20, text: 'Run:\n```sh\nnpm test\n```' }
			],
			0
		);
		expect(document).toContain('## src/index.ts\n\n```ts\nexport const one = 1;\n```');
		expect(document).toContain('## docs/a.md\n\n````md\nRun:\n```sh\nnpm test\n```\n````');
		expect(document).toContain('Every one of the 2 files in the repository was read.');
	});
});
