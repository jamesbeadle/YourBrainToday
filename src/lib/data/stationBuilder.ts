import type { Point, Station, StationTask } from './types';

type StationOverrides = Partial<
	Pick<
		Station,
		'isInterchange' | 'connectingRoles' | 'producesOutput' | 'tickAngle' | 'labelOffset' | 'labelAnchor'
	>
>;

const defaultLabelOffset: Point = { x: 0, y: 32 };

export function station(
	id: string,
	name: string,
	position: Point,
	task: StationTask,
	overrides: StationOverrides = {}
): Station {
	return {
		id,
		name,
		position,
		task,
		isInterchange: false,
		connectingRoles: [],
		tickAngle: 0,
		labelOffset: defaultLabelOffset,
		labelAnchor: 'middle',
		...overrides
	};
}

export const labelAbove: StationOverrides = { tickAngle: 180, labelOffset: { x: 0, y: -26 } };
