import type { SupabaseClient } from '@supabase/supabase-js';

export type HiveReviewApplication = {
	applicationId: string;
	brainName: string;
	ownerEmail: string;
	pitch: string;
	contextCount: number;
	pageCount: number;
	createdAt: string;
};

export async function getHiveReviewQueue(
	supabase: SupabaseClient
): Promise<HiveReviewApplication[]> {
	const { data, error } = await supabase.rpc('hive_mind_review_queue');
	if (error !== null) throw error;
	return (data ?? []).map((row: Record<string, unknown>) => ({
		applicationId: row.application_id as string,
		brainName: row.brain_name as string,
		ownerEmail: row.owner_email as string,
		pitch: row.pitch as string,
		contextCount: Number(row.context_count),
		pageCount: Number(row.page_count),
		createdAt: row.created_at as string
	}));
}

export async function approveHiveApplication(
	supabase: SupabaseClient,
	applicationId: string
): Promise<void> {
	const { error } = await supabase.rpc('approve_hive_mind_application', {
		application_identifier: applicationId
	});
	if (error !== null) throw error;
}

export async function rejectHiveApplication(
	supabase: SupabaseClient,
	applicationId: string,
	note: string
): Promise<void> {
	const { error } = await supabase.rpc('reject_hive_mind_application', {
		application_identifier: applicationId,
		note
	});
	if (error !== null) throw error;
}
