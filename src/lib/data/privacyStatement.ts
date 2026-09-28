import { privacyCollectionSections } from './legal/privacyCollectionSections';
import { privacyRightsSections } from './legal/privacyRightsSections';
import { privacySharingSections } from './legal/privacySharingSections';
import type { LegalDocument } from './legalDocument';

export const privacyStatement: LegalDocument = {
	title: 'Privacy statement',
	metaDescription:
		'How Your Brain Today collects, uses, protects, and deletes your information — across the consultancy, knowledge bases, chatbots and the client portal — and the promise we make about your knowledge.',
	lastUpdatedOn: '5 September 2026',
	sections: [...privacyCollectionSections, ...privacySharingSections, ...privacyRightsSections]
};
