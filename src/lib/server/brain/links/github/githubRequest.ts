import { env } from '$env/dynamic/private';
import { linkUserAgent } from '../linkLimits';

const apiOrigin = 'https://api.github.com';
const rawOrigin = 'https://raw.githubusercontent.com';

const notFound = 404;
const forbidden = 403;
const rateLimited = 429;

export async function requestGithubJson<Answer>(path: string): Promise<Answer> {
	const response = await fetch(`${apiOrigin}${path}`, {
		headers: { ...authorisation(), accept: 'application/vnd.github+json', 'user-agent': linkUserAgent }
	});
	if (!response.ok) throw new Error(describeGithubFailure(response.status));
	return response.json() as Promise<Answer>;
}

export async function fetchRawGithubFile(
	repository: { owner: string; name: string },
	branch: string,
	path: string
): Promise<string> {
	const encodedPath = path.split('/').map(encodeURIComponent).join('/');
	const response = await fetch(
		`${rawOrigin}/${repository.owner}/${repository.name}/${encodeURIComponent(branch)}/${encodedPath}`,
		{ headers: { ...authorisation(), 'user-agent': linkUserAgent } }
	);
	if (!response.ok) throw new Error(describeGithubFailure(response.status));
	return response.text();
}

function authorisation(): Record<string, string> {
	const token = env.GITHUB_TOKEN ?? '';
	if (token === '') return {};
	return { authorization: `Bearer ${token}` };
}

function describeGithubFailure(status: number): string {
	if (status === notFound) return 'GitHub could not find that — it may be private or misspelt';
	if (status === forbidden || status === rateLimited) {
		return 'GitHub is limiting how often we may read — try again in a little while';
	}
	return `GitHub answered with status ${status}`;
}
