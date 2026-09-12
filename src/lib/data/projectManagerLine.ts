import { labelAbove, station } from './stationBuilder';
import { TubeLineColours } from './tubeLineColours';
import type { RoleLine } from './types';

export const projectManagerLine: RoleLine = {
	id: 'project-manager',
	role: 'Project Manager',
	colour: TubeLineColours.piccadilly,
	routes: [
		[
			{ x: 160, y: 180 },
			{ x: 520, y: 180 },
			{ x: 680, y: 340 },
			{ x: 880, y: 340 }
		]
	],
	stations: [
		station(
			'project-setup',
			'Project Setup',
			{ x: 200, y: 180 },
			{
				summary: 'Open the project shell the moment the opportunity is won.',
				inputs: ['Won opportunity', 'Signed contract'],
				outputs: ['Project record']
			}
		),
		station(
			'drawing-register',
			'Drawing Register',
			{ x: 320, y: 180 },
			{
				summary:
					'Receive every drawing revision from Bluebeam automatically and track who has acknowledged it.',
				inputs: ['Bluebeam Studio revisions'],
				outputs: ['Drawing register entry', 'Issue acknowledgments']
			}
		),
		station(
			'rfis-submittals',
			'RFIs & Submittals',
			{ x: 460, y: 180 },
			{
				summary: 'Run RFIs and submittals so nothing is installed before the architect approves it.',
				inputs: ['Site queries', 'Product data'],
				outputs: ['Answered RFIs', 'Approved submittals']
			},
			labelAbove
		),
		station(
			'claim-issued',
			'Claim Issued',
			{ x: 880, y: 340 },
			{
				summary: 'Issue the Programme Valuation Report to the client and log their certification.',
				inputs: ['Programme Valuation Report'],
				outputs: ['Client certificate', 'Payment application']
			}
		)
	]
};
