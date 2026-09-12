import { termsAccountSections } from './legal/termsAccountSections';
import { termsGeneralSections } from './legal/termsGeneralSections';
import { termsProductSections } from './legal/termsProductSections';
import type { LegalDocument } from './legalDocument';

export const termsOfService: LegalDocument = {
	title: 'Terms of service',
	metaDescription:
		'The terms that govern your use of Your Brain Today — the consultancy, accounts and credits, knowledge bases, chatbots, the client portal, and the API and MCP server.',
	lastUpdatedOn: '5 September 2026',
	sections: [...termsAccountSections, ...termsProductSections, ...termsGeneralSections]
};
