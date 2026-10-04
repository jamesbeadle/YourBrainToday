import { renderXAuthor, renderXPost } from './renderXPosts';
import { requestXProfile, requestXTimelinePage, type XAuthor, type XPost } from './xRequest';
import type { LinkedSource } from '../linkedSource';

type TimelineTweet = { full_text?: string; text?: string; created_at?: string; user?: XAuthor };

type TimelineEntry = { type?: string; content?: { tweet?: TimelineTweet } };

const embeddedDataPattern = /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/;

/** A profile's bio and its recent public posts, read from X's embedded timeline. */
export async function readXProfile(link: { handle: string }): Promise<LinkedSource> {
	const posts = await recentPostsOf(link.handle).catch(() => [] as XPost[]);
	const author = (await requestXProfile(link.handle).catch(() => null)) ?? ownAuthorIn(posts, link.handle);
	if (author === null) throw new Error('That X account could not be read');
	return {
		title: `@${author.screen_name} on X`,
		text: [
			`# @${author.screen_name} on X`,
			`Source link: https://x.com/${author.screen_name}`,
			`## Profile\n${renderXAuthor(author)}`,
			renderRecentPosts(posts)
		].join('\n\n')
	};
}

async function recentPostsOf(handle: string): Promise<XPost[]> {
	const page = await requestXTimelinePage(handle);
	const embedded = page.match(embeddedDataPattern);
	if (embedded === null) return [];
	const data = JSON.parse(embedded[1]);
	const entries: TimelineEntry[] = data?.props?.pageProps?.timeline?.entries ?? [];
	return entries
		.map((entry) => entry.content?.tweet)
		.filter((tweet): tweet is TimelineTweet => tweet?.user !== undefined)
		.map((tweet) => ({
			text: tweet.full_text ?? tweet.text ?? '',
			created_at: tweet.created_at,
			author: tweet.user as XAuthor
		}));
}

function ownAuthorIn(posts: XPost[], handle: string): XAuthor | null {
	const own = posts.find((post) => post.author.screen_name.toLowerCase() === handle.toLowerCase());
	return own?.author ?? null;
}

function renderRecentPosts(posts: XPost[]): string {
	if (posts.length === 0) {
		return '## Recent posts\nX did not let us read this account\'s posts without signing in; only the profile was read.';
	}
	return `## Recent posts (${posts.length})\n\n${posts.map(renderXPost).join('\n\n---\n\n')}`;
}
