import { extractWordDocumentText } from './extractWordDocumentText';
import { sourceKindFor } from '$lib/data/brainUploadRules';

const maxTextCharacters = 200_000;

export async function sourceContentBlock(
	fileBytes: Uint8Array,
	mimeType: string
): Promise<unknown> {
	const kind = sourceKindFor(mimeType);
	if (kind === 'pdf') return base64Block('document', mimeType, fileBytes);
	if (kind === 'image') return base64Block('image', mimeType, fileBytes);
	if (kind === 'wordDocument') return textBlock(await extractWordDocumentText(fileBytes));
	return textBlock(new TextDecoder().decode(fileBytes).slice(0, maxTextCharacters));
}

function base64Block(blockType: 'document' | 'image', mimeType: string, fileBytes: Uint8Array) {
	return {
		type: blockType,
		source: {
			type: 'base64',
			media_type: mimeType,
			data: Buffer.from(fileBytes).toString('base64')
		}
	};
}

function textBlock(text: string) {
	return { type: 'text', text: `Source document contents:\n\n${text}` };
}
