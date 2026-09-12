import type { StationTask } from './types';

export const quantitySurveyorTasks: Record<string, StationTask> = {
	tenderReceived: {
		summary: "Log the architect's tender pack and confirm the bid deadline.",
		inputs: ['Tender pack', 'Drawings'],
		outputs: ['Tender record']
	},
	boqTakeOff: {
		summary: 'Measure the drawings and build the Bill of Quantities, package by package.',
		inputs: ['Drawings', 'Bluebeam take-off'],
		outputs: ['Priced BoQ']
	},
	tenderSubmitted: {
		summary: 'Submit the priced tender to the architect and track its outcome.',
		inputs: ['Priced BoQ', 'Prelims schedule'],
		outputs: ['Submitted tender']
	},
	subcontractorQuotes: {
		summary: 'Invite and level subcontractor quotes against each BoQ package.',
		inputs: ['Priced BoQ', 'Subcontractor quotes'],
		outputs: ['Levelled quote comparison']
	},
	workOrderAward: {
		summary: 'Award the package — but only once the compliance gate is green.',
		inputs: ['Levelled quote comparison', 'Verified compliance record'],
		outputs: ['Work order']
	},
	variationPricing: {
		summary: 'Price every variation against the original BoQ headings and the central register.',
		inputs: ['Variation instruction', 'BoQ rates'],
		outputs: ['Priced variation']
	},
	valuationAssessment: {
		summary: 'Assess the value of work done this claim period from approved site progress.',
		inputs: ['Approved site progress', 'Priced variations'],
		outputs: ['Period valuation']
	},
	programmeValuationReport: {
		summary:
			'The Programme Valuation Report — built from approved progress and approved variations, issued every claim period.',
		inputs: ['Period valuation', 'Approved variations'],
		outputs: ['Programme Valuation Report']
	},
	costValueReconciliation: {
		summary:
			'Cost-Value Reconciliation — live margin per package: actual vs forecast vs tender, with Prelims and EOTs visible separately.',
		inputs: ['Period valuation', 'Coded project costs', 'QS accruals'],
		outputs: ['CVR']
	}
};
