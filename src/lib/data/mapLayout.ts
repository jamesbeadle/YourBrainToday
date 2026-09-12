import { TubeLineColours } from './tubeLineColours';
import { labelAbove, station } from './stationBuilder';
import type { RoleLine, Station } from './types';
import type { WorkflowModel, WorkflowRole, WorkflowTask } from './workflowModel';

const mapWidth = 980;
const rowHeight = 96;
const topMargin = 84;
const lineStartX = 90;
const lineEndX = mapWidth - 90;
const maxStationSpacing = 170;

const lineColours = Object.values(TubeLineColours);

export function layoutWorkflowMap(model: WorkflowModel): {
	lines: RoleLine[];
	viewBox: { width: number; height: number };
} {
	const lines = model.roles.map(asRoleLine);
	const height = topMargin + Math.max(lines.length, 2) * rowHeight;
	return { lines, viewBox: { width: mapWidth, height } };
}

function asRoleLine(role: WorkflowRole, roleIndex: number): RoleLine {
	const y = topMargin + roleIndex * rowHeight;
	const stations = role.tasks.map((task, taskIndex) =>
		asStation(role, task, taskIndex, y)
	);
	return {
		id: slugify(role.name),
		role: role.name,
		colour: lineColours[roleIndex % lineColours.length],
		routes: [
			[
				{ x: lineStartX - 25, y },
				{ x: lineEndX + 25, y }
			]
		],
		stations
	};
}

function asStation(role: WorkflowRole, task: WorkflowTask, taskIndex: number, y: number): Station {
	const spacing = stationSpacing(role.tasks.length);
	const position = { x: lineStartX + taskIndex * spacing, y };
	const isHandover = task.handovers.length > 0;
	const shouldLabelAbove = taskIndex % 2 === 1;
	return station(
		`${slugify(role.name)}-${slugify(task.name)}`,
		task.name,
		position,
		{
			summary: task.summary,
			inputs: task.inputs,
			outputs: task.outputs,
			handovers: task.handovers
		},
		{
			isInterchange: isHandover,
			connectingRoles: task.handovers.map((handover) => handover.toRole),
			producesOutput: task.businessOutput,
			...(shouldLabelAbove ? labelAbove : {})
		}
	);
}

function stationSpacing(taskCount: number): number {
	if (taskCount <= 1) return 0;
	return Math.min(maxStationSpacing, (lineEndX - lineStartX) / (taskCount - 1));
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}
