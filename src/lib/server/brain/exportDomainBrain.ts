import { getAllBrainPages } from './getBrainPage';
import { getBrainContexts } from './getBrainContexts';
import { getFullBrainEventLog } from './getBrainEvents';
import { renderExportFiles } from './renderExportFiles';
import { strToU8, zipSync } from 'fflate';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function exportDomainBrain(
	supabase: SupabaseClient,
	brainId: string
): Promise<Uint8Array> {
	const contexts = await getBrainContexts(supabase, brainId);
	const pages = await getAllBrainPages(supabase, brainId);
	const events = await getFullBrainEventLog(supabase, brainId);
	const files = renderExportFiles(contexts, pages, events);
	return zipSync(asZipEntries(files));
}

function asZipEntries(files: Record<string, string>): Record<string, Uint8Array> {
	const entries: Record<string, Uint8Array> = {};
	for (const [path, content] of Object.entries(files)) {
		entries[path] = strToU8(content);
	}
	return entries;
}
