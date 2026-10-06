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
