import type { XAuthor, XPost } from './xRequest';

export function renderXAuthor(author: XAuthor): string {
	const lines = [`${author.name} (@${author.screen_name})`];
	if ((author.description ?? '') !== '') lines.push(`Bio: ${author.description}`);
	return lines.join('\n');
}

export function renderXPost(post: XPost): string {
	const lines = [];
	if (post.created_at !== undefined) lines.push(`Posted ${post.created_at}`);
	if ((post.replying_to ?? null) !== null) lines.push(`In reply to @${post.replying_to}`);
	lines.push(post.text);
	if (post.quote != null) lines.push(renderQuote(post.quote));
	return lines.join('\n');
}

function renderQuote(quote: XPost): string {
	return `Quoting @${quote.author.screen_name}:\n> ${quote.text.split('\n').join('\n> ')}`;
}
