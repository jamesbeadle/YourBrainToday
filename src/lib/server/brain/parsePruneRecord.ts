import { asText, isRecord, parseContextWrites, parsePageRetires, parsePageWrite } from './parseModelWrites';
import type { BrainContextWrite } from './saveBrainContextWrites';
import type { BrainPageWrite } from './saveBrainPageWrites';

export type PruneRecord = {
	findings: string;
	contextWrites: BrainContextWrite[];
	pageWrites: BrainPageWrite[];
	pageRetires: string[];
	logLine: string;
};

const maxPageWrites = 12;

export function parsePruneRecord(candidate: unknown): PruneRecord | null {
	if (!isRecord(candidate)) return null;
	const pageWrites = Array.isArray(candidate.pageWrites)
		? candidate.pageWrites.slice(0, maxPageWrites).flatMap(parsePageWrite)
		: [];
	const record = {
		findings: asText(candidate.findings),
		contextWrites: parseContextWrites(candidate.contextWrites),
		pageWrites,
		pageRetires: parsePageRetires(candidate.pageRetires, pageWrites),
		logLine: asText(candidate.logLine)
	};
	if (record.logLine === '' && record.findings === '') return null;
	return record;
}
