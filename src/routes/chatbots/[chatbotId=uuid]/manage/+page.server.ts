import { answerQuestion, dismissQuestion } from './knowledgeGapActions';
import { topUp, updateAllowances } from './allowanceActions';
import { deleteThisChatbot, rename, setModel, setPaused } from './settingsActions';
import { inviteMember, removeMember, resendInvite, setMemberModelOverride } from './memberActions';
import { getChatbotKnowledgeGaps } from '$lib/server/chatbots/getChatbotKnowledgeGaps';
import { getChatbotMembers } from '$lib/server/chatbots/getChatbotMembers';
import { getChatbotTopUps } from '$lib/server/chatbots/getChatbotTopUps';
import { requireOwnedChatbot } from '$lib/server/chatbots/requireOwnedChatbot';
import { requireUser } from '$lib/server/auth/requireUser';
import { teachingNoteCredits } from '$lib/server/chatbots/teachChatbotAnswer';
import type { Actions, PageServerLoad } from './$types';

// Answering a question reads it into the brain with Claude, which outlives
// Vercel's default function limit.
export const config = { maxDuration: 300 };

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = await requireUser(locals);
	const chatbot = await requireOwnedChatbot(locals.supabase, params.chatbotId, user.id);
	return {
		chatbot,
		members: await getChatbotMembers(locals.supabase, chatbot.id),
		topUps: await getChatbotTopUps(locals.supabase, chatbot.id),
		knowledgeGaps: await getChatbotKnowledgeGaps(locals.supabase, chatbot.id),
		teachingCredits: teachingNoteCredits
	};
};

export const actions: Actions = {
	answerQuestion,
	dismissQuestion,
	rename,
	setPaused,
	setModel,
	deleteChatbot: deleteThisChatbot,
	inviteMember,
	resendInvite,
	removeMember,
	setMemberModel: setMemberModelOverride,
	topUp,
	updateAllowances
};
