import type { BrainSource } from '$lib/data/brainTypes';

export const unreadSourceHint =
	'Not in the brain yet — Read it adds what it knows; credits scale with its size.';

/** The line under a source's name: why it failed, that it is still unread, or what it is about. */
export function sourceDetailLine(source: BrainSource): string {
	const detailLines: Record<BrainSource['status'], string> = {
		uploaded: unreadSourceHint,
		reading: source.summary,
		ingested: source.summary,
		failed: source.failure,
		proposed: source.summary,
		rejected: source.summary
	};
	return detailLines[source.status];
}
