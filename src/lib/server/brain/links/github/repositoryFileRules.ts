export type RepositoryFile = { path: string; size: number };

const skippedFolders = new Set([
	'node_modules', 'vendor', 'dist', 'build', 'out', 'target', 'bin', 'obj', 'coverage',
	'__pycache__', '.git', '.next', '.svelte-kit', '.nuxt', '.cache', 'third_party', '.yarn'
]);

const skippedFilenames = new Set([
	'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb', 'Cargo.lock', 'poetry.lock',
	'Pipfile.lock', 'Gemfile.lock', 'go.sum', 'composer.lock', 'LICENSE', 'LICENSE.md', 'CHANGELOG.md'
]);

const skippedSuffixes = ['.min.js', '.min.css', '.map', '.snap', '.lock', '.svg'];

const readableExtensions = new Set([
	'md', 'mdx', 'txt', 'rst', 'adoc', 'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'svelte', 'vue',
	'py', 'rb', 'go', 'rs', 'java', 'kt', 'kts', 'swift', 'c', 'h', 'cpp', 'hpp', 'cs', 'php',
	'scala', 'ex', 'exs', 'sh', 'bash', 'zsh', 'sql', 'graphql', 'gql', 'proto', 'yaml', 'yml',
	'toml', 'json', 'html', 'css', 'scss', 'prisma', 'tf', 'mo', 'dart', 'lua', 'r', 'ipynb'
]);

const readableBareFilenames = new Set(['Dockerfile', 'Makefile', 'Gemfile', 'Rakefile', 'Procfile']);

export const largestReadableFileBytes = 120 * 1024;

export function isReadableRepositoryFile(file: RepositoryFile): boolean {
	if (file.size > largestReadableFileBytes) return false;
	const segments = file.path.split('/');
	const filename = segments[segments.length - 1];
	if (segments.some((segment) => skippedFolders.has(segment))) return false;
	if (skippedFilenames.has(filename)) return false;
	if (skippedSuffixes.some((suffix) => filename.endsWith(suffix))) return false;
	if (readableBareFilenames.has(filename)) return true;
	return readableExtensions.has(extensionOf(filename));
}

export function extensionOf(filename: string): string {
	const dot = filename.lastIndexOf('.');
	if (dot <= 0) return '';
	return filename.slice(dot + 1).toLowerCase();
}

/** Lower reads first: the readme, then the docs, then the code, then data and configuration. */
export function readingPriorityOf(path: string): number {
	const filename = path.split('/').pop() ?? '';
	const extension = extensionOf(filename);
	if (/^readme/i.test(filename)) return 0;
	if (extension === 'md' || extension === 'mdx' || extension === 'rst') return 1;
	if (extension === 'json' || extension === 'yaml' || extension === 'yml' || extension === 'toml') return 3;
	return 2;
}
