export type ChatbotExchange = {
	id: string;
	askedByEmail: string | null;
	question: string;
	answerMarkdown: string;
	citedPageKeys: string[];
	askedAt: string;
	hasPreferredAnswer: boolean;
};

// The log shows the newest exchanges; the CSV carries the same set.
export const mostExchangesShown = 200;
