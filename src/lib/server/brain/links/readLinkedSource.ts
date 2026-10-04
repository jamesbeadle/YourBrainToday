import { readGitHubFile } from './github/readGitHubFile';
import { readGitHubRepository } from './github/readGitHubRepository';
import { recogniseLink } from './linkTargets';
import { parseLinkUrl } from './linkUrl';
import { readXPost } from './x/readXPost';
import { readXProfile } from './x/readXProfile';
import { fetchLinkedPage } from './fetchLinkedPage';
import type { LinkedSource } from './linkedSource';

/** Reads whatever a link points at — a repository, an X account or post, or a web page — as text. */
export async function readLinkedSource(link: string): Promise<LinkedSource> {
	const url = parseLinkUrl(link);
	const target = recogniseLink(url);
	if (target.kind === 'githubRepository') return readGitHubRepository(target);
	if (target.kind === 'githubFile') return readGitHubFile(target);
	if (target.kind === 'xPost') return readXPost(target);
	if (target.kind === 'xProfile') return readXProfile(target);
	return readWebPage(url);
}

async function readWebPage(url: URL): Promise<LinkedSource> {
	const page = await fetchLinkedPage(url);
	return { title: page.title, text: `# ${page.title}\n\nSource link: ${url.href}\n\n${page.text}` };
}
