import type { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccountByEmail } from '$lib/server/sharing/resolveAccountByEmail';

export type KnowledgeBaseShare = { id: string; viewerEmail: string };

export async function getKnowledgeBaseShares(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<KnowledgeBaseShare[]> {
	const { data, error } = await supabase
		.from('kb_shares')
		.select('id, viewer_email')
		.eq('knowledge_base_id', knowledgeBaseId)
		.order('created_at');
	if (error !== null) throw error;
	return (data ?? []).map((row) => ({ id: row.id, viewerEmail: row.viewer_email }));
}

export async function shareKnowledgeBase(
	supabase: SupabaseClient,
	knowledgeBaseId: string,
	viewerEmail: string
): Promise<string | null> {
	const account = await resolveAccountByEmail(supabase, viewerEmail);
	if (account === null) return 'No account uses that email address.';
	const { error } = await supabase.from('kb_shares').insert({
		knowledge_base_id: knowledgeBaseId,
		viewer_id: account.id,
		viewer_email: account.email
	});
	if (error !== null) return 'That knowledge base is already shared with them.';
	return null;
}

export async function removeKnowledgeBaseShare(
	supabase: SupabaseClient,
	shareId: string
): Promise<void> {
	const { error } = await supabase.from('kb_shares').delete().eq('id', shareId);
	if (error !== null) throw error;
}
