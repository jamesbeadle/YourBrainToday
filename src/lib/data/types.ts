export type Point = { x: number; y: number };

export type StationHandover = {
	toRole: string;
	failureNote?: string;
};

export type StationTask = {
	summary: string;
	inputs: string[];
	outputs: string[];
	handovers?: StationHandover[];
};

export type Station = {
	id: string;
	name: string;
	position: Point;
	isInterchange: boolean;
	connectingRoles: string[];
	producesOutput?: string;
	tickAngle: number;
	labelOffset: Point;
	labelAnchor: 'start' | 'middle' | 'end';
	task: StationTask;
};

export type RoleLine = {
	id: string;
	role: string;
	colour: string;
	routes: Point[][];
	stations: Station[];
};
