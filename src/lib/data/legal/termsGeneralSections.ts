import type { LegalSection } from '$lib/data/legalDocument';

export const termsGeneralSections: LegalSection[] = [
	{
		heading: 'Acceptable use',
		paragraphs: ['When using the service you must not:'],
		listItems: [
			'upload content that is unlawful, or that infringes someone else’s rights;',
			'attempt to disrupt, overload, probe, or gain unauthorised access to the service;',
			'use the interviewer, a brain, or a chatbot to generate unlawful or harmful material;',
			'circumvent credit charges or manipulate credit balances;',
			'share a token or authorisation with someone who should not have your access;',
			'resell access to the service, or to a chatbot, without our written agreement.'
		]
	},
	{
		heading: 'Ending your account',
		paragraphs: [
			'You can stop using the service at any time, and you can ask us to delete your account, which removes your knowledge bases, your chatbots and their conversations, and any unspent credits — export anything you want to keep first. Records we must keep by law, such as purchase records, are kept for as long as the law requires.',
			'We can restrict, suspend, or delete an account that breaks these terms. Where it is reasonable to do so, we will warn you first.'
		]
	},
	{
		heading: 'Our liability',
		paragraphs: [
			'During early access the service is provided as it stands, without warranties beyond those the law implies. Nothing in these terms excludes liability that cannot be excluded under English law, including for death or personal injury caused by negligence, or for fraud.',
			'Beyond that, our total liability to you under these terms is limited to the amount you paid us for the service in the 12 months before the event giving rise to the claim, and we are not liable for loss of profit, loss of business, or losses caused by relying on AI-generated output without checking it. Liability for consultancy work is governed by the written agreement for that engagement.'
		]
	},
	{
		heading: 'Changes to these terms',
		paragraphs: [
			'We may update these terms as the service grows. If a change is material we will flag it on the site or by email before it takes effect. Continuing to use the service after a change takes effect means you accept it; if you do not, stop using the service and ask us to delete your account.'
		]
	},
	{
		heading: 'Governing law',
		paragraphs: [
			'These terms are governed by the law of England and Wales, and the courts of England and Wales have jurisdiction over any dispute — although if you are a consumer you keep any protections and venue rights your local law gives you.'
		]
	}
];
