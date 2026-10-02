import { pageHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Where a page slug can be read: the first filed brain holding it that the caller may see. */
export async function findPageFiling(supabase: SupabaseClient, slug: string): Promise<string | null> {
	const { data: pageRows, error: pageError } = await supabase
		.from('brain_pages')
		.select('brain_id')
		.eq('slug', slug);
	if (pageError !== null) throw pageError;
	const domainBrainIds = [...new Set((pageRows ?? []).map((row) => row.brain_id as string))];
	if (domainBrainIds.length === 0) return null;
	const { data: filingRows, error: filingError } = await supabase
		.from('kb_brains')
		.select('id, knowledge_base_id')
		.in('domain_brain_id', domainBrainIds)
		.order('created_at')
		.limit(1);
	if (filingError !== null) throw filingError;
	const filing = (filingRows ?? [])[0];
	if (filing === undefined) return null;
	return pageHref(filing.knowledge_base_id, filing.id, slug);
}
