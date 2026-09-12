export const faceExpressionNames = [
	'neutral',
	'happy',
	'curious',
	'surprised',
	'focused'
] as const;

export type FaceExpressionName = (typeof faceExpressionNames)[number];

export type FaceChatSpeaker = 'user' | 'face';

export type FaceChatTurn = { speaker: FaceChatSpeaker; text: string };

export type FaceChatReply = {
	reply: string;
	expression: FaceExpressionName;
	citedSlugs: string[];
};
