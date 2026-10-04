import { chooseRepositoryFiles } from './chooseRepositoryFiles';
import { fetchRawGithubFile, requestGithubJson } from './githubRequest';
import { renderRepositoryDocument, type ReadFile, type RepositoryFacts } from './renderRepositoryDocument';
import { longestLinkedTextCharacters } from '../linkLimits';
import type { LinkedSource } from '../linkedSource';
import type { RepositoryFile } from './repositoryFileRules';

type RepositoryLink = { owner: string; name: string; branch: string | null; folder: string };

type RepositoryAnswer = {
	full_name: string;
	html_url: string;
	description: string | null;
	language: string | null;
	topics?: string[];
	default_branch: string;
};

type TreeAnswer = { tree: { path: string; type: string; size?: number }[] };

const filesFetchedAtOnce = 8;

/** A repository, or one folder of it, read the way a newcomer would read it. */
export async function readGitHubRepository(link: RepositoryLink): Promise<LinkedSource> {
	const repository = await requestGithubJson<RepositoryAnswer>(`/repos/${link.owner}/${link.name}`);
	const branch = link.branch ?? repository.default_branch;
	const files = await listRepositoryFiles(link, branch);
	const { chosen, unreadCount } = chooseRepositoryFiles(files, link.folder, longestLinkedTextCharacters);
	if (chosen.length === 0) throw new Error('That repository has no files we can read as text');
	const read = await readFiles(link, branch, chosen);
	const facts: RepositoryFacts = {
		fullName: repository.full_name,
		url: repository.html_url,
		description: repository.description ?? '',
		language: repository.language ?? '',
		topics: repository.topics ?? [],
		branch,
		folder: link.folder,
		fileCount: files.length
	};
	return {
		title: titleFor(facts),
		text: renderRepositoryDocument(facts, read, unreadCount)
	};
}

async function listRepositoryFiles(link: RepositoryLink, branch: string): Promise<RepositoryFile[]> {
	const answer = await requestGithubJson<TreeAnswer>(
		`/repos/${link.owner}/${link.name}/git/trees/${encodeURIComponent(branch)}?recursive=1`
	);
	return answer.tree
		.filter((entry) => entry.type === 'blob')
		.map((entry) => ({ path: entry.path, size: entry.size ?? 0 }));
}

async function readFiles(
	link: RepositoryLink,
	branch: string,
	files: RepositoryFile[]
): Promise<ReadFile[]> {
	const read: ReadFile[] = [];
	for (let start = 0; start < files.length; start += filesFetchedAtOnce) {
		const batch = files.slice(start, start + filesFetchedAtOnce);
		const texts = await Promise.all(batch.map((file) => fetchRawGithubFile(link, branch, file.path)));
		batch.forEach((file, index) => read.push({ ...file, text: texts[index] }));
	}
	return read;
}

function titleFor(facts: RepositoryFacts): string {
	const scope = facts.folder === '' ? facts.fullName : `${facts.fullName}/${facts.folder}`;
	return `${scope} (GitHub)`;
}
