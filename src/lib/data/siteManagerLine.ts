import { labelAbove, station } from './stationBuilder';
import { TubeLineColours } from './tubeLineColours';
import type { RoleLine } from './types';

export const siteManagerLine: RoleLine = {
	id: 'site-manager',
	role: 'Site Manager',
	colour: TubeLineColours.district,
	routes: [
		[
			{ x: 160, y: 420 },
			{ x: 880, y: 420 }
		],
		[
			{ x: 540, y: 420 },
			{ x: 700, y: 260 }
		]
	],
	stations: [
		station(
			'site-mobilisation',
			'Site Mobilisation',
			{ x: 240, y: 420 },
			{
				summary: 'Open the site — but only once the H&S mobilisation checklist is signed off.',
				inputs: ['Work orders', 'Mobilisation checklist'],
				outputs: ['Live site']
			},
			{
				isInterchange: true,
				connectingRoles: ['Health & Safety'],
				labelOffset: { x: 16, y: -14 },
				labelAnchor: 'start'
			}
		),
		station(
			'daily-progress',
			'Daily Progress',
			{ x: 360, y: 420 },
			{
				summary: 'Capture progress, photos and attendance from the workface every day.',
				inputs: ['Foreman reports', 'Photos', 'Timesheets'],
				outputs: ['Approved site progress']
			}
		),
		station(
			'quality-snags',
			'Quality & Snags',
			{ x: 480, y: 420 },
			{
				summary: 'Inspect work, raise snags and chase them closed, trade by trade.',
				inputs: ['Approved site progress', 'Specification'],
				outputs: ['Snag list', 'Closed snags']
			}
		),
		station(
			'practical-completion',
			'Practical Completion',
			{ x: 720, y: 420 },
			{
				summary:
					'Walk the client through, sign off Practical Completion and trigger settlement and the VAT analysis.',
				inputs: ['Closed snags', 'Completion pack'],
				outputs: ['PC certificate', 'Settlement trigger']
			},
			labelAbove
		),
		station(
			'defects-aftercare',
			'Defects & Aftercare',
			{ x: 860, y: 420 },
			{
				summary: 'Manage the defects period and close out aftercare visits.',
				inputs: ['PC certificate', 'Defect reports'],
				outputs: ['Closed defects']
			}
		)
	]
};
