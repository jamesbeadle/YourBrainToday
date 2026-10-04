import { termsAccountSections } from './legal/termsAccountSections';
import { termsGeneralSections } from './legal/termsGeneralSections';
import { termsProductSections } from './legal/termsProductSections';
import type { LegalDocument } from './legalDocument';

export const termsOfService: LegalDocument = {
	title: 'Terms of service',
	metaDescription:
		'The terms that govern your use of Your Brain Today — accounts and credits, knowledge bases, chatbots and their question log, and the API and MCP server.',
	lastUpdatedOn: '4 October 2026',
	sections: [...termsAccountSections, ...termsProductSections, ...termsGeneralSections]
};
