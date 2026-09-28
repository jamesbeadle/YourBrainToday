import type { ChatbotExchange } from '$lib/data/chatbotQuestionLog';
import type { ChatbotRuling } from '$lib/data/chatbotRulings';

const dateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

export function askedLineFor(exchange: ChatbotExchange): string {
	const asker = exchange.askedByEmail ?? 'a former member';
	return `${asker} · ${dateFormat.format(new Date(exchange.askedAt))}`;
}

export function rulingLineFor(ruling: ChatbotRuling): string {
	const set = dateFormat.format(new Date(ruling.createdAt));
	if (ruling.askedByEmail === null) return `Set ${set}`;
	return `First asked by ${ruling.askedByEmail} · set ${set}`;
}

export function citationLineFor(exchange: ChatbotExchange): string | null {
	const count = exchange.citedPageKeys.length;
	if (count === 0) return null;
	return count === 1 ? 'Cited 1 page' : `Cited ${count} pages`;
}
