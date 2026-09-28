import { env } from '$env/dynamic/private';
import { speakerTurnsText, type SpokenSegment } from './speakerTurnsText';

const openAiTranscriptionsUrl = 'https://api.openai.com/v1/audio/transcriptions';
const speakerLabellingModel = 'gpt-4o-transcribe-diarize';
const speakerLabelledFormat = 'diarized_json';
const automaticChunking = 'auto';
const failureDetailLimit = 300;

type SpeakerLabelledTranscription = { duration: number; segments: SpokenSegment[] };

export type RecordingTranscript = { text: string; durationSeconds: number };

export function isTranscriptionConfigured(): boolean {
	return (env.OPENAI_API_KEY ?? '') !== '';
}

export async function transcribeAudio(
	audio: Uint8Array<ArrayBuffer>,
	filename: string,
	mimeType: string
): Promise<RecordingTranscript> {
	if (!isTranscriptionConfigured()) {
		throw new Error('OPENAI_API_KEY is not set — add it to .env');
	}
	const response = await fetch(openAiTranscriptionsUrl, {
		method: 'POST',
		headers: { authorization: `Bearer ${env.OPENAI_API_KEY}` },
		body: transcriptionForm(audio, filename, mimeType)
	});
	if (!response.ok) throw new Error(await describeFailure(response));
	const transcription: SpeakerLabelledTranscription = await response.json();
	return {
		text: speakerTurnsText(transcription.segments),
		durationSeconds: transcription.duration
	};
}

function transcriptionForm(
	audio: Uint8Array<ArrayBuffer>,
	filename: string,
	mimeType: string
): FormData {
	const form = new FormData();
	form.append('file', new Blob([audio], { type: mimeType }), filename);
	form.append('model', speakerLabellingModel);
	form.append('response_format', speakerLabelledFormat);
	form.append('chunking_strategy', automaticChunking);
	return form;
}

async function describeFailure(response: Response): Promise<string> {
	const detail = (await response.text()).slice(0, failureDetailLimit);
	return `OpenAI transcription failed with status ${response.status}: ${detail}`;
}
