import { linkUserAgent } from '../linkLimits';

const fixTweetOrigin = 'https://api.fxtwitter.com';
const syndicationOrigin = 'https://syndication.twitter.com';

const notFound = 404;

export type XAuthor = { name: string; screen_name: string; description?: string };

export type XPost = {
	text: string;
	created_at?: string;
	author: XAuthor;
	replying_to?: string | null;
	quote?: XPost | null;
};

/** The post as the public FixTweet API describes it, which needs no X account to read. */
export async function requestXPost(handle: string, postId: string): Promise<XPost> {
	const answer = await requestJson<{ tweet?: XPost; message?: string }>(
		`${fixTweetOrigin}/${encodeURIComponent(handle)}/status/${postId}`
	);
	if (answer.tweet === undefined) throw new Error(answer.message ?? 'That post could not be read');
	return answer.tweet;
}

export async function requestXProfile(handle: string): Promise<XAuthor | null> {
	const answer = await requestJson<{ user?: XAuthor }>(`${fixTweetOrigin}/${encodeURIComponent(handle)}`);
	return answer.user ?? null;
}

/** X's embedded-timeline page for a profile, which carries the recent posts as JSON. */
export async function requestXTimelinePage(handle: string): Promise<string> {
	const response = await fetch(
		`${syndicationOrigin}/srv/timeline-profile/screen-name/${encodeURIComponent(handle)}`,
		{ headers: { 'user-agent': linkUserAgent, accept: 'text/html' } }
	);
	if (!response.ok) throw new Error(describeXFailure(response.status));
	return response.text();
}

async function requestJson<Answer>(url: string): Promise<Answer> {
	const response = await fetch(url, {
		headers: { 'user-agent': linkUserAgent, accept: 'application/json' }
	});
	if (!response.ok) throw new Error(describeXFailure(response.status));
	return response.json() as Promise<Answer>;
}

function describeXFailure(status: number): string {
	if (status === notFound) return 'That X account or post could not be found — it may be private';
	return `X answered with status ${status}`;
}
