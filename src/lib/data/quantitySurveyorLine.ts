import { quantitySurveyorTasks } from './quantitySurveyorTasks';
import { station } from './stationBuilder';
import { TubeLineColours } from './tubeLineColours';
import type { RoleLine } from './types';

export const quantitySurveyorLine: RoleLine = {
	id: 'quantity-surveyor',
	role: 'QS / Estimator',
	colour: TubeLineColours.central,
	routes: [
		[
			{ x: 100, y: 260 },
			{ x: 700, y: 260 },
			{ x: 840, y: 400 }
		]
	],
	stations: [
		station('tender-received', 'Tender Received', { x: 100, y: 260 }, quantitySurveyorTasks.tenderReceived),
		station('boq-take-off', 'BoQ Take-off', { x: 200, y: 260 }, quantitySurveyorTasks.boqTakeOff),
		station('tender-submitted', 'Tender Submitted', { x: 300, y: 260 }, quantitySurveyorTasks.tenderSubmitted),
		station(
			'subcontractor-quotes',
			'Subbie Quotes',
			{ x: 400, y: 260 },
			quantitySurveyorTasks.subcontractorQuotes
		),
		station(
			'work-order-award',
			'Work Order Award',
			{ x: 480, y: 260 },
			quantitySurveyorTasks.workOrderAward,
			{ isInterchange: true, connectingRoles: ['Office & Compliance'], labelOffset: { x: 0, y: 34 } }
		),
		station(
			'variation-pricing',
			'Variation Pricing',
			{ x: 600, y: 260 },
			quantitySurveyorTasks.variationPricing,
			{
				isInterchange: true,
				connectingRoles: ['Project Manager'],
				labelOffset: { x: 14, y: -16 },
				labelAnchor: 'start'
			}
		),
		station(
			'valuation-assessment',
			'Valuation Assessment',
			{ x: 700, y: 260 },
			quantitySurveyorTasks.valuationAssessment,
			{
				isInterchange: true,
				connectingRoles: ['Site Manager'],
				labelOffset: { x: 18, y: -10 },
				labelAnchor: 'start'
			}
		),
		station('pvr', 'PVR', { x: 780, y: 340 }, quantitySurveyorTasks.programmeValuationReport, {
			isInterchange: true,
			connectingRoles: ['Project Manager'],
			producesOutput: 'Programme Valuation Report',
			labelOffset: { x: 18, y: -12 },
			labelAnchor: 'start'
		}),
		station('cvr', 'CVR', { x: 840, y: 400 }, quantitySurveyorTasks.costValueReconciliation, {
			isInterchange: true,
			connectingRoles: ['Finance Director'],
			producesOutput: 'Cost-Value Reconciliation',
			labelOffset: { x: 18, y: 6 },
			labelAnchor: 'start'
		})
	]
};
