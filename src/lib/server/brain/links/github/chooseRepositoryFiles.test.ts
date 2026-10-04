import { describe, expect, it } from 'vitest';
import { chooseRepositoryFiles } from './chooseRepositoryFiles';

const repository = [
	{ path: 'src/deep/module/logic.ts', size: 900 },
	{ path: 'package-lock.json', size: 50_000 },
	{ path: 'node_modules/left-pad/index.js', size: 100 },
	{ path: 'docs/guide.md', size: 2_000 },
	{ path: 'README.md', size: 1_000 },
	{ path: 'src/index.ts', size: 800 },
	{ path: 'logo.png', size: 4_000 },
	{ path: 'package.json', size: 300 },
	{ path: 'bundle.min.js', size: 3_000 }
];

describe('chooseRepositoryFiles', () => {
	it('reads the readme, then docs, then the code from the root outwards, then configuration', () => {
		const { chosen } = chooseRepositoryFiles(repository, '', 100_000);
		expect(chosen.map((file) => file.path)).toEqual([
			'README.md',
			'docs/guide.md',
			'src/index.ts',
			'src/deep/module/logic.ts',
			'package.json'
		]);
	});

	it('leaves dependencies, lockfiles, binaries and minified bundles unread', () => {
		const { chosen, unreadCount } = chooseRepositoryFiles(repository, '', 100_000);
		expect(chosen.some((file) => file.path.includes('node_modules'))).toBe(false);
		expect(unreadCount).toBe(4);
	});

	it('stays within the budget, taking smaller files that still fit', () => {
		const { chosen } = chooseRepositoryFiles(repository, '', 2_400);
		expect(chosen.map((file) => file.path)).toEqual(['README.md', 'src/index.ts', 'package.json']);
	});

	it('reads only the folder the link pointed at', () => {
		const { chosen } = chooseRepositoryFiles(repository, 'docs', 100_000);
		expect(chosen.map((file) => file.path)).toEqual(['docs/guide.md']);
	});
});
