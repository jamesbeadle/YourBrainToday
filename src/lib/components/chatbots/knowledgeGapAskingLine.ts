import type { KnowledgeGap } from '$lib/data/chatbotTypes';

const dateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

export function askingLineFor(gap: KnowledgeGap): string {
	const asker = gap.askedByEmail ?? 'a former member';
	const lastAsked = dateFormat.format(new Date(gap.lastAskedAt));
	if (gap.timesAsked === 1) return `Asked by ${asker} · ${lastAsked}`;
	return `Asked ${gap.timesAsked} times, first by ${asker} · last ${lastAsked}`;
}

export function answeredLineFor(gap: KnowledgeGap): string {
	if (gap.resolvedAt === null) return 'Taught';
	return `Taught ${dateFormat.format(new Date(gap.resolvedAt))}`;
}
