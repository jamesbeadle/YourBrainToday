import mammoth from 'mammoth';

const maxExtractedCharacters = 200_000;

export async function extractWordDocumentText(fileBytes: Uint8Array): Promise<string> {
	const { value } = await mammoth.extractRawText({ buffer: Buffer.from(fileBytes) });
	return value.slice(0, maxExtractedCharacters);
}
