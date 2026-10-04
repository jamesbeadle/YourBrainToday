import type { RememberRecord } from '$lib/server/brain/parseRememberRecord';

export function rememberedReply(record: RememberRecord, proposedCount: number): string {
	if (proposedCount === 0) return record.replyMarkdown;
	const changes = proposedCount === 1 ? 'One change is' : `${proposedCount} changes are`;
	return `${record.replyMarkdown}\n\n_${changes} waiting under Review — the brain's owner approves it before it enters the model._`;
}
