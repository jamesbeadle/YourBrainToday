export type LegalSection = {
	heading: string;
	paragraphs: string[];
	listItems?: string[];
};

export type LegalDocument = {
	title: string;
	metaDescription: string;
	lastUpdatedOn: string;
	sections: LegalSection[];
};
