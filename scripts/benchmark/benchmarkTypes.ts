import type { AnthropicUsage } from '$lib/data/anthropicUsage';

export const armNames = ['documents', 'brains', 'brains-self'] as const;

export type ArmName = (typeof armNames)[number];

export type BenchmarkQuestion = {
	id: string;
	question: string;
	goldAnswer: string;
	brain: 'expertise' | 'experience' | 'process' | 'human' | 'cross';
	notes?: string;
};

export type ArmAnswer = {
	answerMarkdown: string;
	citedSources: string[];
	pagesRead: string[];
	contextCharacters: number;
};

export type Arm = {
	name: ArmName;
	setupNote: string;
	answer: (question: string) => Promise<ArmAnswer>;
};

export type Judgement = {
	correctness: number;
	completeness: number;
	groundedness: number;
	reason: string;
};

export type BenchmarkRun = {
	questionId: string;
	brain: BenchmarkQuestion['brain'];
	arm: ArmName;
	repeat: number;
	answer: ArmAnswer;
	isFallback: boolean;
	usage: AnthropicUsage;
	callCount: number;
	latencyMilliseconds: number;
	judgement: Judgement;
};

export type BenchmarkSettings = {
	knowledgeBaseId: string;
	questionsPath: string;
	model: string;
	judgeModel: string;
	repeats: number;
	arms: ArmName[];
	documentBudgetCharacters: number;
};
