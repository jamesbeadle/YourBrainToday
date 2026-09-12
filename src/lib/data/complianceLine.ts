import { station } from './stationBuilder';
import { TubeLineColours } from './tubeLineColours';
import type { RoleLine } from './types';

export const complianceLine: RoleLine = {
	id: 'compliance',
	role: 'Office & Compliance',
	colour: TubeLineColours.bakerloo,
	routes: [
		[
			{ x: 120, y: 100 },
			{ x: 320, y: 100 },
			{ x: 480, y: 260 }
		]
	],
	stations: [
		station(
			'subbie-onboarding',
			'Subbie Onboarding',
			{ x: 160, y: 100 },
			{
				summary: 'Register a new subcontractor and open their compliance file.',
				inputs: ['Subcontractor details', 'Trade and package'],
				outputs: ['Compliance file']
			},
			{ tickAngle: 180, labelOffset: { x: 0, y: -26 } }
		),
		station(
			'insurance-cis-checks',
			'Insurance & CIS Checks',
			{ x: 300, y: 100 },
			{
				summary: 'Verify insurance, certifications and CIS status before any award can happen.',
				inputs: ['Compliance file', 'Insurance certificates', 'CIS registration'],
				outputs: ['Verified compliance record']
			},
			{ tickAngle: 180, labelOffset: { x: 0, y: -26 } }
		),
		station(
			'expiry-tracking',
			'Expiry Tracking',
			{ x: 440, y: 220 },
			{
				summary: 'Track every insurance and certification expiry, chasing renewals before they lapse.',
				inputs: ['Verified compliance record'],
				outputs: ['Renewal chasers', 'Compliance alerts']
			},
			{ tickAngle: 45, labelOffset: { x: -12, y: 18 }, labelAnchor: 'end' }
		)
	]
};
