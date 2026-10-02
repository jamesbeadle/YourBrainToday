import { asStoredSource, storedSourceColumns } from '$lib/server/brain/findBrainSource';
import { downloadSourceFile } from '$lib/server/brain/downloadSourceFile';
import { sourceContentBlock } from '$lib/server/brain/sourceContentBlock';
import type { SupabaseClient } from '@supabase/supabase-js';

export type DocumentBundle = {
	contentBlocks: unknown[];
	filenames: string[];
	contextCharacters: number;
	budgetNote: string;
};

type TextBlock = { type: 'text'; text: string };

const ingestedStatus = 'ingested';
const domainCategory = 'domain';

/**
 * Every ingested source of the knowledge base's expertise brains, downloaded
 * and turned into the same content blocks the ingest reads, each introduced
 * by its filename. Over the budget, text blocks are shortened evenly;
 * binary blocks (PDFs, images) cannot be and are left whole.
 */
export async function loadKnowledgeBaseDocuments(
	supabase: SupabaseClient,
	knowledgeBaseId: string,
	budgetCharacters: number
): Promise<DocumentBundle> {
	const brainIds = await expertiseBrainIds(supabase, knowledgeBaseId);
	const { data, error } = await supabase
		.from('brain_sources')
		.select(storedSourceColumns)
		.in('brain_id', brainIds)
		.eq('status', ingestedStatus)
		.order('created_at');
	if (error !== null) throw error;
	const sources = ((data ?? []) as unknown as Record<string, unknown>[]).map(asStoredSource);
	const contentBlocks: unknown[] = [];
	for (const source of sources) {
		const fileBytes = await downloadSourceFile(supabase, source.storagePath);
		contentBlocks.push({ type: 'text', text: `## File: ${source.filename}` });
		contentBlocks.push(await sourceContentBlock(fileBytes, source.mimeType));
	}
	const fitted = fitToBudget(contentBlocks, budgetCharacters);
	return { ...fitted, filenames: sources.map((source) => source.filename) };
}

async function expertiseBrainIds(supabase: SupabaseClient, knowledgeBaseId: string): Promise<string[]> {
	const { data, error } = await supabase
		.from('kb_brains')
		.select('domain_brain_id')
		.eq('knowledge_base_id', knowledgeBaseId)
		.eq('category', domainCategory)
		.not('domain_brain_id', 'is', null);
	if (error !== null) throw error;
	return (data ?? []).map((row) => row.domain_brain_id as string);
}

function fitToBudget(contentBlocks: unknown[], budgetCharacters: number) {
	const total = contentBlocks.reduce((sum: number, block) => sum + charactersOf(block), 0);
	if (total <= budgetCharacters) return { contentBlocks, contextCharacters: total, budgetNote: '' };
	const textTotal = contentBlocks.filter(isTextBlock).reduce((sum, block) => sum + block.text.length, 0);
	const binaryTotal = total - textTotal;
	const keepShare = Math.max(0, (budgetCharacters - binaryTotal) / textTotal);
	const fitted = contentBlocks.map((block) =>
		isTextBlock(block) ? { ...block, text: block.text.slice(0, Math.floor(block.text.length * keepShare)) } : block
	);
	const contextCharacters = fitted.reduce((sum: number, block) => sum + charactersOf(block), 0);
	const budgetNote =
		`The documents total ${total.toLocaleString('en-GB')} characters, over the budget of ` +
		`${budgetCharacters.toLocaleString('en-GB')}; every text block was cut to ${Math.round(keepShare * 100)}% ` +
		`of its length (${contextCharacters.toLocaleString('en-GB')} characters sent).`;
	return { contentBlocks: fitted, contextCharacters, budgetNote };
}

function isTextBlock(block: unknown): block is TextBlock {
	return (block as TextBlock).type === 'text' && typeof (block as TextBlock).text === 'string';
}

function charactersOf(block: unknown): number {
	if (isTextBlock(block)) return block.text.length;
	const source = (block as { source?: { data?: string } }).source;
	return source?.data?.length ?? 0;
}
