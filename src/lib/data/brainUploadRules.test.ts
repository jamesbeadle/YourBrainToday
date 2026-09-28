import { describe, expect, it } from 'vitest';
import { isAcceptedUpload, isRecording, sourceKindFor } from './brainUploadRules';

const megabyte = 1024 * 1024;
const iPhoneVoiceMemo = 'audio/x-m4a';

describe('voice recordings', () => {
	it('recognises the formats phones and browsers record in', () => {
		const phoneAndBrowserFormats = [iPhoneVoiceMemo, 'audio/mp4', 'audio/mpeg', 'audio/webm'];
		for (const mimeType of phoneAndBrowserFormats) {
			expect(isRecording(mimeType)).toBe(true);
		}
	});

	it('does not mistake documents for recordings', () => {
		expect(isRecording('application/pdf')).toBe(false);
		expect(isRecording('text/plain')).toBe(false);
	});

	it('accepts a recording up to 24MB and refuses anything larger', () => {
		expect(isAcceptedUpload(iPhoneVoiceMemo, 24 * megabyte)).toBe(true);
		expect(isAcceptedUpload(iPhoneVoiceMemo, 24 * megabyte + 1)).toBe(false);
	});

	it('refuses audio formats the transcriber cannot read', () => {
		expect(sourceKindFor('audio/amr')).toBeNull();
	});
});
