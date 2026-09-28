import type { ChatbotSpeaker } from '$lib/data/chatbotTypes';

export type LoggedMessage = {
	id: string;
	conversationId: string;
	memberId: string;
	speaker: ChatbotSpeaker;
	body: string;
	citedPageKeys: string[];
	createdAt: string;
};

export type PairedExchange = {
	id: string;
	memberId: string;
	question: string;
	answerMarkdown: string;
	citedPageKeys: string[];
	askedAt: string;
};

const speakerOrder: Record<ChatbotSpeaker, number> = { member: 0, bot: 1 };

// A member's question and the bot's answer are written together, so they
// share a timestamp; ordering the member first at a tie pairs each answer
// with the question that came before it in the same conversation. The
// newest exchange comes first.
export function pairExchanges(messages: LoggedMessage[]): PairedExchange[] {
	const openQuestions = new Map<string, LoggedMessage>();
	const exchanges: PairedExchange[] = [];
	for (const message of [...messages].sort(byTimeThenMemberFirst)) {
		if (message.speaker === 'member') {
			openQuestions.set(message.conversationId, message);
			continue;
		}
		const question = openQuestions.get(message.conversationId);
		if (question === undefined) continue;
		openQuestions.delete(message.conversationId);
		exchanges.push(exchangeOf(question, message));
	}
	return exchanges.reverse();
}

function exchangeOf(question: LoggedMessage, answer: LoggedMessage): PairedExchange {
	return {
		id: answer.id,
		memberId: question.memberId,
		question: question.body,
		answerMarkdown: answer.body,
		citedPageKeys: answer.citedPageKeys,
		askedAt: question.createdAt
	};
}

function byTimeThenMemberFirst(left: LoggedMessage, right: LoggedMessage): number {
	const byTime = left.createdAt.localeCompare(right.createdAt);
	if (byTime !== 0) return byTime;
	return speakerOrder[left.speaker] - speakerOrder[right.speaker];
}
