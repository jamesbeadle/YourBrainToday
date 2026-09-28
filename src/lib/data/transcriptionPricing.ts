import { costMarkup, creditValuePence, usdToGbp } from './creditPricing';

/**
 * Recordings are priced by their length, which the transcriber reports once
 * it has listened. Before then the reserve guesses the length from the file
 * size at a phone voice memo's bitrate (64 kbit/s), and the difference is
 * refunded or charged afterwards. The rate is OpenAI's published estimate
 * for gpt-4o-transcribe-diarize, marked up like every other job.
 */
const transcriptionUsdPerMinute = 0.006;
const voiceMemoBytesPerSecond = 8_000;
const secondsPerMinute = 60;
const penceInPound = 100;
const leastTranscriptionCredits = 1;

export function transcriptionCreditsFor(durationSeconds: number): number {
	const minutes = durationSeconds / secondsPerMinute;
	const billPence = minutes * transcriptionUsdPerMinute * usdToGbp * penceInPound;
	const markedUp = Math.ceil((billPence * costMarkup) / creditValuePence);
	return Math.max(leastTranscriptionCredits, markedUp);
}

export function transcriptionReserveCreditsFor(byteCount: number): number {
	return transcriptionCreditsFor(byteCount / voiceMemoBytesPerSecond);
}
