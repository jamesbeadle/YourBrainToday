import { proposalRowsFor, type ProposedWrites } from './proposalRows';
import { recordBrainEvent } from '$lib/server/brain/recordBrainEvent';
import type { SupabaseClient } from '@supabase/supabase-js';

export const chatCorrectionFilename = 'Remembered from chat';

export type ChatProposer = { id: string; email: string };

export async function proposeChatCorrection(
	service: SupabaseClient,
	brainId: string,
	proposer: ChatProposer,
	writes: ProposedWrites
): Promise<number> {
	const origin = {
		brainId,
		proposerEmail: proposer.email,
		proposerId: proposer.id,
		sourceId: null,
		sourceFilename: chatCorrectionFilename
	};
	const rows = await proposalRowsFor(service, origin, writes);
	if (rows.length === 0) return 0;
	const { error } = await service.from('brain_change_proposals').insert(rows);
	if (error !== null) throw error;
	await recordBrainEvent(service, {
		brainId,
		kind: 'changes_proposed',
		detail: { filename: chatCorrectionFilename, changeCount: rows.length, proposerEmail: proposer.email }
	});
	return rows.length;
}
