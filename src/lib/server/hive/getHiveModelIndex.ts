import { renderDomainModelIndex } from '../brain/getBrainPageIndex';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { BrainContext, BrainPageSummary, DomainBlockKind } from '$lib/data/brainTypes';
import type { HiveMember } from '$lib/data/hiveTypes';

export type HiveSpecialistModel = {
	member: HiveMember;
	contexts: BrainContext[];
	pages: BrainPageSummary[];
};

export async function getHiveModelIndex(
	supabase: SupabaseClient,
	members: HiveMember[]
): Promise<HiveSpecialistModel[]> {
	const contextRows = await snapshotContexts(supabase);
	const pageRows = await snapshotPageIndex(supabase);
	return members.map((member) => ({
		member,
		contexts: contextRows.filter((row) => row.memberId === member.id).map((row) => row.context),
		pages: pageRows.filter((row) => row.memberId === member.id).map((row) => row.page)
	}));
}

export function renderHiveMindIndex(specialists: HiveSpecialistModel[]): string {
	if (specialists.length === 0) return 'The hive is empty — no specialists have joined yet.';
	return specialists.map(renderSpecialist).join('\n\n');
}

function renderSpecialist(specialist: HiveSpecialistModel): string {
	const { member, contexts, pages } = specialist;
	const keyedPages = pages.map((page) => ({ ...page, slug: `${member.handle}/${page.slug}` }));
	const header = `## Specialist: ${member.specialtyName} [${member.handle}]\n${member.pitch}`;
	return `${header}\n\n${renderDomainModelIndex(contexts, keyedPages)}`;
}

async function snapshotContexts(
	supabase: SupabaseClient
): Promise<{ memberId: string; context: BrainContext }[]> {
	const { data, error } = await supabase
		.from('hive_mind_snapshot_contexts')
		.select('member_id, slug, name, summary, is_core_domain')
		.order('is_core_domain', { ascending: false })
		.order('name');
	if (error !== null) throw error;
	return (data ?? []).map((row) => ({
		memberId: row.member_id,
		context: {
			slug: row.slug,
			name: row.name,
			summary: row.summary,
			isCoreDomain: row.is_core_domain
		}
	}));
}

async function snapshotPageIndex(
	supabase: SupabaseClient
): Promise<{ memberId: string; page: BrainPageSummary }[]> {
	const { data, error } = await supabase.rpc('hive_mind_page_index');
	if (error !== null) throw error;
	return (data ?? []).map((row: Record<string, unknown>) => ({
		memberId: row.member_id as string,
		page: {
			slug: row.slug as string,
			title: row.title as string,
			summary: row.summary as string,
			kind: row.kind as DomainBlockKind,
			contextSlug: row.context_slug as string | null
		}
	}));
}
