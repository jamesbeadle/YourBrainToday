export type BrainSourceKind = 'pdf' | 'image' | 'wordDocument' | 'plainText' | 'recording';

const megabyte = 1024 * 1024;

const acceptedMimeTypes: Record<string, BrainSourceKind> = {
	'application/pdf': 'pdf',
	'image/png': 'image',
	'image/jpeg': 'image',
	'image/gif': 'image',
	'image/webp': 'image',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'wordDocument',
	'text/plain': 'plainText',
	'text/markdown': 'plainText',
	'audio/mpeg': 'recording',
	'audio/mp3': 'recording',
	'audio/mp4': 'recording',
	'audio/m4a': 'recording',
	'audio/x-m4a': 'recording',
	'audio/wav': 'recording',
	'audio/wave': 'recording',
	'audio/x-wav': 'recording',
	'audio/webm': 'recording',
	'audio/ogg': 'recording',
	'audio/flac': 'recording',
	'audio/x-flac': 'recording'
};

const maxByteCountByKind: Record<BrainSourceKind, number> = {
	pdf: 20 * megabyte,
	image: 4 * megabyte,
	wordDocument: 15 * megabyte,
	plainText: 2 * megabyte,
	recording: 24 * megabyte
};

export const acceptedUploadExtensions =
	'.pdf,.png,.jpg,.jpeg,.gif,.webp,.docx,.txt,.md,.m4a,.mp3,.wav,.webm,.ogg,.flac';

export function sourceKindFor(mimeType: string): BrainSourceKind | null {
	return acceptedMimeTypes[mimeType] ?? null;
}

export function isRecording(mimeType: string): boolean {
	return sourceKindFor(mimeType) === 'recording';
}

export function isAcceptedUpload(mimeType: string, byteCount: number): boolean {
	const kind = sourceKindFor(mimeType);
	if (kind === null) return false;
	return byteCount > 0 && byteCount <= maxByteCountByKind[kind];
}

export function uploadLimitDescription(): string {
	return (
		'PDF up to 20MB, Word up to 15MB, images up to 4MB, text or markdown up to 2MB, ' +
		'voice recordings (M4A, MP3, WAV, WebM, OGG, FLAC) up to 24MB.'
	);
}
