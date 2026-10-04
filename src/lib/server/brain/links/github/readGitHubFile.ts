import { extensionOf } from './repositoryFileRules';
import { fetchRawGithubFile } from './githubRequest';
import { longestLinkedTextCharacters } from '../linkLimits';
import type { LinkedSource } from '../linkedSource';

type FileLink = { owner: string; name: string; branch: string; path: string };

/** One file from a repository, with where it came from kept above it. */
export async function readGitHubFile(link: FileLink): Promise<LinkedSource> {
	const text = await fetchRawGithubFile(link, link.branch, link.path);
	const url = `https://github.com/${link.owner}/${link.name}/blob/${link.branch}/${link.path}`;
	const fence = '```';
	return {
		title: `${link.owner}/${link.name}/${link.path} (GitHub)`,
		text: [
			`# ${link.path} — from ${link.owner}/${link.name} on branch ${link.branch}`,
			`Source link: ${url}`,
			`${fence}${extensionOf(link.path)}\n${text.slice(0, longestLinkedTextCharacters)}\n${fence}`
		].join('\n\n')
	};
}
