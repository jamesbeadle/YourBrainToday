import { isReadableRepositoryFile, readingPriorityOf, type RepositoryFile } from './repositoryFileRules';

export type ChosenFiles = { chosen: RepositoryFile[]; unreadCount: number };

export const longestFileCharacters = 24_000;

const smallestWorthwhileRemainder = 500;

/**
 * Which of a repository's files are worth reading, in the order a newcomer
 * would read them, within a budget of characters: the readme and docs first,
 * then the code nearest the root, skipping dependencies, builds and lockfiles.
 */
export function chooseRepositoryFiles(
	files: RepositoryFile[],
	folder: string,
	budgetCharacters: number
): ChosenFiles {
	const candidates = files
		.filter((file) => isWithinFolder(file.path, folder))
		.filter(isReadableRepositoryFile)
		.sort(byReadingOrder);
	const chosen: RepositoryFile[] = [];
	let remaining = budgetCharacters;
	for (const file of candidates) {
		if (remaining < smallestWorthwhileRemainder) break;
		const cost = Math.min(file.size, longestFileCharacters);
		if (cost > remaining) continue;
		chosen.push(file);
		remaining -= cost;
	}
	return { chosen, unreadCount: files.length - chosen.length };
}

function isWithinFolder(path: string, folder: string): boolean {
	if (folder === '') return true;
	return path === folder || path.startsWith(`${folder}/`);
}

function byReadingOrder(first: RepositoryFile, second: RepositoryFile): number {
	const priorityGap = readingPriorityOf(first.path) - readingPriorityOf(second.path);
	if (priorityGap !== 0) return priorityGap;
	const depthGap = depthOf(first.path) - depthOf(second.path);
	if (depthGap !== 0) return depthGap;
	return first.path.localeCompare(second.path);
}

function depthOf(path: string): number {
	return path.split('/').length;
}
