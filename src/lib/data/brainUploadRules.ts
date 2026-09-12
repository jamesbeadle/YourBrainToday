export type BrainSourceKind = 'pdf' | 'image' | 'wordDocument' | 'plainText';

const megabyte = 1024 * 1024;

const acceptedMimeTypes: Record<string, BrainSourceKind> = {
	'application/pdf': 'pdf',
	'image/png': 'image',
	'image/jpeg': 'image',
	'image/gif': 'image',
	'image/webp': 'image',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'wordDocument',
	'text/plain': 'plainText',
	'text/markdown': 'plainText'
};

const maxByteCountByKind: Record<BrainSourceKind, number> = {
	pdf: 20 * megabyte,
	image: 4 * megabyte,
	wordDocument: 15 * megabyte,
	plainText: 2 * megabyte
};

export const acceptedUploadExtensions = '.pdf,.png,.jpg,.jpeg,.gif,.webp,.docx,.txt,.md';

export function sourceKindFor(mimeType: string): BrainSourceKind | null {
	return acceptedMimeTypes[mimeType] ?? null;
}

export function isAcceptedUpload(mimeType: string, byteCount: number): boolean {
	const kind = sourceKindFor(mimeType);
	if (kind === null) return false;
	return byteCount > 0 && byteCount <= maxByteCountByKind[kind];
}

export function uploadLimitDescription(): string {
	return 'PDF up to 20MB, Word up to 15MB, images up to 4MB, text or markdown up to 2MB.';
}
