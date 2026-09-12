import type { HiveEarningsShare } from './splitHiveMindEarnings';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function recordHiveMindQuestion(
	supabase: SupabaseClient,
	question: string,
	answerMarkdown: string,
	citedPageKeys: string[],
	shares: HiveEarningsShare[]
): Promise<void> {
	const { data, error } = await supabase
		.from('hive_mind_questions')
		.insert({
			question,
			answer_markdown: answerMarkdown,
			cited_page_keys: citedPageKeys
		})
		.select('id')
		.single();
	if (error !== null) throw error;
	if (shares.length === 0) return;
	const { error: contributionError } = await supabase.rpc('record_hive_mind_contributions', {
		question_identifier: data.id,
		member_identifiers: shares.map((share) => share.memberId),
		pages_read_counts: shares.map((share) => share.pagesRead),
		award_amounts: shares.map((share) => share.creditsAwarded)
	});
	if (contributionError !== null) throw contributionError;
}
