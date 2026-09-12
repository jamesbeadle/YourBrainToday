export type HiveMember = {
	id: string;
	handle: string;
	specialtyName: string;
	pitch: string;
	approvedAt: string;
	questionCount: number;
};

export type HiveContributor = {
	specialtyName: string;
	pagesRead: number;
};

export type HiveAnswer = {
	answerMarkdown: string;
	contributors: HiveContributor[];
	creditBalance: number;
};

export type HiveApplicationStatus = 'pending' | 'approved' | 'rejected';

export type HiveApplication = {
	id: string;
	status: HiveApplicationStatus;
	pitch: string;
	decisionNote: string;
	createdAt: string;
};

export type HiveMembership = {
	approvedAt: string;
	questionCount: number;
	creditsEarned: number;
};

export type HiveBrainStatus = {
	application: HiveApplication | null;
	membership: HiveMembership | null;
};
