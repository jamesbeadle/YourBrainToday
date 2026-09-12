import { station } from './stationBuilder';
import { TubeLineColours } from './tubeLineColours';
import type { RoleLine } from './types';

export const financeDirectorLine: RoleLine = {
	id: 'finance-director',
	role: 'Finance Director',
	colour: TubeLineColours.metropolitan,
	routes: [
		[
			{ x: 260, y: 500 },
			{ x: 740, y: 500 },
			{ x: 840, y: 400 }
		]
	],
	stations: [
		station(
			'cost-capture',
			'Cost Capture',
			{ x: 420, y: 500 },
			{
				summary: 'Capture every cost — supplier invoices, timesheets, CIS — against its cost code.',
				inputs: ['Supplier invoices', 'Timesheets', 'Work orders'],
				outputs: ['Coded project costs']
			}
		),
		station(
			'cashflow-forecast',
			'Cashflow Forecast',
			{ x: 500, y: 500 },
			{
				summary:
					'The live cashflow forecast — forward income, commitments and predicted completion across the whole portfolio.',
				inputs: ['Coded project costs', 'CVR', 'Claim schedule'],
				outputs: ['Cashflow forecast']
			},
			{ producesOutput: 'Portfolio Cashflow Forecast', labelOffset: { x: 0, y: 36 } }
		),
		station(
			'settlement-vat',
			'Settlement & VAT',
			{ x: 620, y: 500 },
			{
				summary: 'Run the settlement record and the zero-rated VAT analysis at project completion.',
				inputs: ['Settlement trigger', 'Project ledger'],
				outputs: ['Settlement record', 'VAT analysis']
			}
		),
		station(
			'retention-release',
			'Retention Release',
			{ x: 760, y: 480 },
			{
				summary: 'Track retention through the defects period and release it on time.',
				inputs: ['Settlement record', 'Defects status'],
				outputs: ['Retention release']
			},
			{ tickAngle: -45, labelOffset: { x: 16, y: 16 }, labelAnchor: 'start' }
		)
	]
};
