import { isAcceptedUpload, uploadLimitDescription } from '$lib/data/brainUploadRules';
import { sentDataByteCount } from './storeSentData';
import type { SentData } from './sentDataTypes';

export const longestSentTitle = 200;

const plainTextMimeType = 'text/plain';

export function readSentData(title: unknown, text: unknown): SentData {
	return {
		title: String(title ?? '').trim().slice(0, longestSentTitle),
		text: String(text ?? '').trim()
	};
}

export function sentDataProblem(sent: SentData): string | null {
	if (sent.title === '') return 'Give the data a title, so the owner can find it among the ingested data.';
	if (sent.text === '') return 'There is no text to learn from.';
	if (!isAcceptedUpload(plainTextMimeType, sentDataByteCount(sent))) {
		return `That is too much text to send at once. ${uploadLimitDescription()}`;
	}
	return null;
}
