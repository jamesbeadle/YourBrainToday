export type ConversationAuthor = 'user' | 'agent';

export type ConversationTurn = {
	author: ConversationAuthor;
	body: string;
};
