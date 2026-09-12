import { chatbotQuietMessages } from '$lib/data/chatbotQuietMessages';
import type { ChatbotSummary } from '$lib/data/chatbotTypes';

// Null while the member can still ask; otherwise what replaces the composer.
export function quietMessageFor(
	chatbot: ChatbotSummary,
	allowanceRemaining: number,
	creditsPerQuestion: number,
	ownerName: string
): string | null {
	if (chatbot.isPaused) return chatbotQuietMessages.paused;
	if (chatbot.poolCredits < creditsPerQuestion) return chatbotQuietMessages.poolEmpty;
	if (allowanceRemaining < creditsPerQuestion) return chatbotQuietMessages.allowanceUsedUp(ownerName);
	return null;
}
