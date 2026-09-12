import { companyDetails } from '$lib/data/companyDetails';
import type { LegalSection } from '$lib/data/legalDocument';

export const termsAccountSections: LegalSection[] = [
	{
		heading: 'Who we are',
		paragraphs: [
			`Your Brain Today is operated by ${companyDetails.legalName}, a company registered in England and Wales under number ${companyDetails.registrationNumber}, with its registered office at ${companyDetails.registeredAddress} (“we”, “us”). You can reach us at ${companyDetails.consultingEmail}.`,
			'These terms govern your use of yourbrain.today and every part of the service: accounts and credits, knowledge bases and the brains inside them, chatbots, the client portal, and the API and MCP server. By creating an account, accepting a chatbot invitation, or signing in to the client portal you agree to them. If you are using the service on behalf of a business, you confirm you have authority to bind that business.'
		]
	},
	{
		heading: 'The consultancy',
		paragraphs: [
			'Our consultancy work — learning how your business runs and automating it — is agreed in writing with each client, and that written agreement sets out the scope, the fees, and what we deliver. These terms cover the service that supports that work: the client portal where requests are raised and followed, and the tools we build and host for you. If the written agreement and these terms disagree, the written agreement wins for that engagement.',
			'An enquiry sent through the contact page is not a contract. It creates a lead in our client register so that we can reply, and nothing more.'
		]
	},
	{
		heading: 'Early access',
		paragraphs: [
			'The service is in early access. Tools may change, gain features, lose features, or be withdrawn as we build. Where a change materially affects something you have paid credits for, we will give you reasonable notice where we can.'
		]
	},
	{
		heading: 'Your account',
		paragraphs: [
			'You can sign in with Google, or with an email address and password. Your account is yours alone: keep your credentials secure, and tell us promptly if you believe someone else has used them. You are responsible for activity that happens under your account, you must be at least 18, and the information you give us must be accurate and kept up to date.'
		]
	},
	{
		heading: 'Credits and payment',
		paragraphs: [
			'The tools are paid for with credits, bought in packs through our payment provider, Stripe. The price of each pack is shown before you buy, and the credit cost of each action — an interview reply, a document read, a question to a brain or a chatbot — is shown in the service before you take it.',
			'Credits are a prepayment for services, not money. They carry no cash value, earn no interest, and cannot be exchanged outside the service, although you can send credits to another account holder using the sending feature. Promotional credits we grant are free of charge and can be withdrawn if unused.',
			'If you change your mind about a pack within 14 days of buying it and have not spent any of its credits, contact us and we will refund it. Once credits from a pack have been spent, the work has been done and the pack is no longer refundable, except where the law says otherwise. Nothing in these terms limits your statutory rights as a consumer.'
		]
	}
];
