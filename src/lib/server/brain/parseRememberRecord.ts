import { asText, isRecord, parseContextWrites, parsePageWrite } from './parseModelWrites';
import type { BrainContextWrite } from './saveBrainContextWrites';
import type { BrainPageWrite } from './saveBrainPageWrites';

export type RememberRecord = {
	contextWrites: BrainContextWrite[];
	pageWrites: BrainPageWrite[];
	replyMarkdown: string;
	logLine: string;
};

const maxPageWrites = 4;

const fallbackReply =
	'I could not work out what to remember from that — say it again in a sentence and I will note it.';

export function parseRememberRecord(candidate: unknown): RememberRecord {
	if (!isRecord(candidate)) return nothingRemembered();
	const pageWrites = Array.isArray(candidate.pageWrites)
		? candidate.pageWrites.slice(0, maxPageWrites).flatMap(parsePageWrite)
		: [];
	const replyMarkdown = asText(candidate.replyMarkdown);
	return {
		contextWrites: parseContextWrites(candidate.contextWrites),
		pageWrites,
		replyMarkdown: replyMarkdown === '' ? fallbackReply : replyMarkdown,
		logLine: asText(candidate.logLine)
	};
}

function nothingRemembered(): RememberRecord {
	return { contextWrites: [], pageWrites: [], replyMarkdown: fallbackReply, logLine: '' };
}

export function hasChanges(record: RememberRecord): boolean {
	const { pageWrites, contextWrites } = record;
	return pageWrites.length > 0 || contextWrites.length > 0;
}
