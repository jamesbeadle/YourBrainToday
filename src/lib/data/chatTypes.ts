export type ChatAuthor = 'agent' | 'user';

export type ChatMessage = {
	id: number;
	author: ChatAuthor;
	text: string;
};
