import { getChatbotBrains, type ChatbotBrainModel } from './getChatbotBrains';
import { getChatbotExperience, type ChatbotExperienceItem } from './getChatbotExperience';
import { getChatbotProcessMaps, type ChatbotProcessMap } from './getChatbotProcessMaps';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ChatbotKnowledge = {
	brains: ChatbotBrainModel[];
	experience: ChatbotExperienceItem[];
	processMaps: ChatbotProcessMap[];
};

// All three brains of the knowledge base, read on the service client — so
// only after the caller has proved membership through the spend RPC.
export async function getChatbotKnowledge(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<ChatbotKnowledge> {
	return {
		brains: await getChatbotBrains(supabase, knowledgeBaseId),
		experience: await getChatbotExperience(supabase, knowledgeBaseId),
		processMaps: await getChatbotProcessMaps(supabase, knowledgeBaseId)
	};
}
