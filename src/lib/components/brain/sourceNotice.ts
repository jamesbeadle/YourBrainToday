export type SourceNotice = { text: string; isGood: boolean };

export const goodNotice = (text: string): SourceNotice => ({
	text,
	isGood: true
});

export const badNotice = (text: string): SourceNotice => ({
	text,
	isGood: false
});
