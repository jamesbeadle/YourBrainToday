export function safeStorageFilename(filename: string): string {
	return filename.replace(/[^a-zA-Z0-9._-]+/g, '-');
}
