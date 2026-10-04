import { extensionOf, type RepositoryFile } from './repositoryFileRules';
import { longestFileCharacters } from './chooseRepositoryFiles';

export type RepositoryFacts = {
	fullName: string;
	url: string;
	description: string;
	language: string;
	topics: string[];
	branch: string;
	folder: string;
	fileCount: number;
};

export type ReadFile = RepositoryFile & { text: string };

const plainFence = '```';
const outerFence = '````';

/** The repository as one document: what it is, which files were read, then each file in full. */
export function renderRepositoryDocument(
	facts: RepositoryFacts,
	files: ReadFile[],
	unreadCount: number
): string {
	return [
		`# ${facts.fullName} — GitHub repository`,
		`Source link: ${facts.url}`,
		describeRepository(facts),
		describeCoverage(facts, files.length, unreadCount),
		'## Files read',
		files.map((file) => `- ${file.path}`).join('\n'),
		...files.map(renderFile)
	].join('\n\n');
}

function describeRepository(facts: RepositoryFacts): string {
	const lines = [];
	if (facts.description !== '') lines.push(`Description: ${facts.description}`);
	if (facts.language !== '') lines.push(`Primary language: ${facts.language}`);
	if (facts.topics.length > 0) lines.push(`Topics: ${facts.topics.join(', ')}`);
	lines.push(`Branch: ${facts.branch}`);
	if (facts.folder !== '') lines.push(`Folder: ${facts.folder}`);
	return lines.join('\n');
}

function describeCoverage(facts: RepositoryFacts, readCount: number, unreadCount: number): string {
	const scope = facts.folder === '' ? 'the repository' : `the folder ${facts.folder}`;
	if (unreadCount === 0) return `Every one of the ${readCount} files in ${scope} was read.`;
	return (
		`${readCount} of ${facts.fileCount} files in ${scope} were read. The other ${unreadCount} ` +
		'were dependencies, builds, lockfiles, binaries, or beyond the reading budget.'
	);
}

function renderFile(file: ReadFile): string {
	const fence = file.text.includes(plainFence) ? outerFence : plainFence;
	const body = file.text.length > longestFileCharacters ? truncate(file.text) : file.text;
	return `## ${file.path}\n\n${fence}${extensionOf(file.path)}\n${body}\n${fence}`;
}

function truncate(text: string): string {
	const kept = text.slice(0, longestFileCharacters);
	return `${kept}\n… truncated at ${longestFileCharacters} characters of ${text.length}`;
}
