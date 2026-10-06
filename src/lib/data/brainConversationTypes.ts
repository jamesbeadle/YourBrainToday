export type BrainAnswer = {
	answerMarkdown: string;
	citedSlugs: string[];
};

export type BrainConversationChannel = 'brain' | 'face' | 'api';

export type BrainSpeaker = 'user' | 'modeller';

export type BrainConversationTurn = { speaker: BrainSpeaker; text: string };

export type BrainConversationMessage = {
	id: number;
	speaker: BrainSpeaker;
	body: string;
	citedSlugs: string[];
	createdAt: string;
};

export type BrainConversationThread = {
	conversationId: string | null;
	messages: BrainConversationMessage[];
};
