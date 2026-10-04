import { renderXAuthor, renderXPost } from './renderXPosts';
import { requestXPost } from './xRequest';
import type { LinkedSource } from '../linkedSource';

export async function readXPost(link: { handle: string; postId: string }): Promise<LinkedSource> {
	const post = await requestXPost(link.handle, link.postId);
	const url = `https://x.com/${post.author.screen_name}/status/${link.postId}`;
	return {
		title: `@${post.author.screen_name} on X: ${firstWordsOf(post.text)}`,
		text: [
			`# Post by @${post.author.screen_name} on X`,
			`Source link: ${url}`,
			`## Author\n${renderXAuthor(post.author)}`,
			`## Post\n${renderXPost(post)}`
		].join('\n\n')
	};
}

const longestTitleWords = 8;

function firstWordsOf(text: string): string {
	const words = text.split(/\s+/).filter((word) => word !== '');
	const opening = words.slice(0, longestTitleWords).join(' ');
	return words.length > longestTitleWords ? `${opening}…` : opening;
}
