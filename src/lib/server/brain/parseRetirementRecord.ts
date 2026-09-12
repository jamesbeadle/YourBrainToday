import { parsePageWrite } from './parseModelWrites';
import type { BrainPageWrite } from './saveBrainPageWrites';

export type RetirementRecord = {
	pageDeletes: string[];
	pageWrites: BrainPageWrite[];
	contextDeletes: string[];
	logLine: string;
};

const maxPageDeletes = 20;
const maxPageWrites = 10;
const maxContextDeletes = 4;

export function parseRetirementRecord(candidate: unknown): RetirementRecord | null {
	if (typeof candidate !== 'object' || candidate === null) return null;
	const record = candidate as Record<string, unknown>;
	return {
		pageDeletes: asSlugList(record.pageDeletes, maxPageDeletes),
		pageWrites: asPageWrites(record.pageWrites),
		contextDeletes: asSlugList(record.contextDeletes, maxContextDeletes),
		logLine: typeof record.logLine === 'string' ? record.logLine : ''
	};
}

function asPageWrites(candidate: unknown): BrainPageWrite[] {
	if (!Array.isArray(candidate)) return [];
	return candidate.slice(0, maxPageWrites).flatMap(parsePageWrite);
}

function asSlugList(candidate: unknown, limit: number): string[] {
	if (!Array.isArray(candidate)) return [];
	return candidate
		.filter((entry): entry is string => typeof entry === 'string')
		.map((entry) => entry.trim())
		.filter((entry) => entry !== '')
		.slice(0, limit);
}
