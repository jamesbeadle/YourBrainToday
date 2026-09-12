import { station } from './stationBuilder';
import { TubeLineColours } from './tubeLineColours';
import type { RoleLine } from './types';

export const healthSafetyLine: RoleLine = {
	id: 'health-safety',
	role: 'Health & Safety',
	colour: TubeLineColours.victoria,
	routes: [
		[
			{ x: 140, y: 560 },
			{ x: 380, y: 560 },
			{ x: 240, y: 420 }
		],
		[
			{ x: 380, y: 560 },
			{ x: 640, y: 560 }
		]
	],
	stations: [
		station(
			'hs-framework',
			'H&S Framework',
			{ x: 180, y: 560 },
			{
				summary: 'Maintain RAMS templates, policies and the inspection framework.',
				inputs: ['Regulations', 'Insurer requirements'],
				outputs: ['H&S framework']
			}
		),
		station(
			'rams-inductions',
			'RAMS & Inductions',
			{ x: 300, y: 560 },
			{
				summary: 'Approve RAMS and induct every operative before they set foot on site.',
				inputs: ['Subcontractor RAMS', 'Operative details'],
				outputs: ['Approved RAMS', 'Induction records']
			}
		),
		station(
			'site-inspections',
			'Site Inspections',
			{ x: 460, y: 560 },
			{
				summary: 'Inspect live sites on a fixed cadence and log every observation.',
				inputs: ['Live site', 'Inspection checklist'],
				outputs: ['Inspection reports', 'Observations']
			}
		),
		station(
			'incidents-corrective',
			'Incidents & Actions',
			{ x: 580, y: 560 },
			{
				summary: 'Govern incidents and drive corrective actions to closure with a full audit trail.',
				inputs: ['Incident reports', 'Observations'],
				outputs: ['Corrective actions', 'Audit trail']
			}
		)
	]
};
