import { asText, isRecord, parseContextWrites, parsePageRetires, parsePageWrite } from './parseModelWrites';
import type { BrainContextWrite } from './saveBrainContextWrites';
import type { BrainPageWrite } from './saveBrainPageWrites';

export type IngestRecord = {
	sourceSummary: string;
	contextWrites: BrainContextWrite[];
	pageWrites: BrainPageWrite[];
	pageRetires: string[];
	logLine: string;
};

const maxPageWrites = 10;

export function parseIngestRecord(candidate: unknown): IngestRecord | null {
	if (!isRecord(candidate) || !Array.isArray(candidate.pageWrites)) return null;
	const pageWrites = candidate.pageWrites.slice(0, maxPageWrites).flatMap(parsePageWrite);
	const record = {
		sourceSummary: asText(candidate.sourceSummary),
		contextWrites: parseContextWrites(candidate.contextWrites),
		pageWrites,
		pageRetires: parsePageRetires(candidate.pageRetires, pageWrites),
		logLine: asText(candidate.logLine)
	};
	if (isEmptyHanded(record)) return null;
	return record;
}

function isEmptyHanded(record: IngestRecord): boolean {
	if (record.pageWrites.length > 0 || record.contextWrites.length > 0) return false;
	if (record.pageRetires.length > 0) return false;
	return record.sourceSummary === '' && record.logLine === '';
}
