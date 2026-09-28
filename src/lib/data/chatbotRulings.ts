export type ChatbotRuling = {
	id: string;
	question: string;
	preferredAnswer: string;
	askedByEmail: string | null;
	createdAt: string;
};

export const longestRulingQuestion = 1000;
export const longestPreferredAnswer = 4000;

// How many rulings the bot is shown at every question, and how much of each.
export const mostRulingsInPrompt = 60;
export const longestRulingInPrompt = 600;
