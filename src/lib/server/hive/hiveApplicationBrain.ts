import type { SupabaseClient } from '@supabase/supabase-js';

export type HiveApplicationContext = {
	slug: string;
	name: string;
	summary: string;
	isCoreDomain: boolean;
};

export type HiveApplicationPage = {
	contextSlug: string | null;
	kind: string;
	slug: string;
	title: string;
	summary: string;
	body: string;
};

export async function getHiveApplicationContexts(
	supabase: SupabaseClient,
	applicationId: string
): Promise<HiveApplicationContext[]> {
	const { data, error } = await supabase.rpc('hive_mind_application_contexts', {
		application_identifier: applicationId
	});
	if (error !== null) throw error;
	return (data ?? []).map((row: Record<string, unknown>) => ({
		slug: row.slug as string,
		name: row.name as string,
		summary: row.summary as string,
		isCoreDomain: Boolean(row.is_core_domain)
	}));
}

export async function getHiveApplicationPages(
	supabase: SupabaseClient,
	applicationId: string
): Promise<HiveApplicationPage[]> {
	const { data, error } = await supabase.rpc('hive_mind_application_pages', {
		application_identifier: applicationId
	});
	if (error !== null) throw error;
	return (data ?? []).map((row: Record<string, unknown>) => ({
		contextSlug: (row.context_slug as string | null) ?? null,
		kind: row.kind as string,
		slug: row.slug as string,
		title: row.title as string,
		summary: row.summary as string,
		body: row.body as string
	}));
}
