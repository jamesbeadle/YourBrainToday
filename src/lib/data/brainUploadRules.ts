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

const mimeTypesByExtension: Record<string, string> = {
	pdf: 'application/pdf',
	png: 'image/png',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	gif: 'image/gif',
	webp: 'image/webp',
	docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	txt: 'text/plain',
	md: 'text/markdown'
};

export const acceptedUploadExtensions = Object.keys(mimeTypesByExtension)
	.map((extension) => `.${extension}`)
	.join(',');

/** Browsers often declare no type for markdown or Word files; the extension says what they are. */
export function mimeTypeFor(filename: string, declaredMimeType: string): string {
	if (sourceKindFor(declaredMimeType) !== null) return declaredMimeType;
	const extension = filename.split('.').pop()?.toLowerCase() ?? '';
	return mimeTypesByExtension[extension] ?? declaredMimeType;
}

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
