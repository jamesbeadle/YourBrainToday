import { allTasks } from '$lib/data/workflowModel';
import type { WorkflowModel, WorkflowTask } from '$lib/data/workflowModel';

export type Journey = {
	businessOutput: string;
	isTraceable: boolean;
	taskNamesOnPath: string[];
};

export function traceJourneys(model: WorkflowModel): Journey[] {
	return allTasks(model)
		.filter((task) => task.businessOutput !== undefined)
		.map((task) => traceBackwards(model, task));
}

export function producersOf(model: WorkflowModel, inputName: string): WorkflowTask[] {
	return allTasks(model).filter((task) => task.outputs.includes(inputName));
}

export function consumersOf(model: WorkflowModel, outputName: string): WorkflowTask[] {
	return allTasks(model).filter((task) => task.inputs.includes(outputName));
}

function traceBackwards(model: WorkflowModel, terminalTask: WorkflowTask): Journey {
	const visitedTaskNames = new Set<string>();
	const isTraceable = reachesExternalInput(model, terminalTask, visitedTaskNames);
	return {
		businessOutput: terminalTask.businessOutput ?? '',
		isTraceable,
		taskNamesOnPath: [...visitedTaskNames]
	};
}

function reachesExternalInput(
	model: WorkflowModel,
	task: WorkflowTask,
	visitedTaskNames: Set<string>
): boolean {
	if (visitedTaskNames.has(task.name)) return false;
	visitedTaskNames.add(task.name);
	if (task.inputs.length === 0) return false;
	return task.inputs.every((input) => inputHasTraceableSource(model, input, visitedTaskNames));
}

function inputHasTraceableSource(
	model: WorkflowModel,
	inputName: string,
	visitedTaskNames: Set<string>
): boolean {
	if (model.externalInputs.includes(inputName)) return true;
	const producers = producersOf(model, inputName);
	return producers.some((producer) => reachesExternalInput(model, producer, visitedTaskNames));
}
