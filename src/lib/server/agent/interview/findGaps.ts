import { consumersOf, producersOf, traceJourneys } from './traceJourneys';
import type { Gap } from './gapTypes';
import type { WorkflowModel, WorkflowRole, WorkflowTask } from '$lib/data/workflowModel';

export function findGaps(model: WorkflowModel): Gap[] {
	return [
		...unnamedBusiness(model),
		...noExternalInputs(model),
		...perRole(model, lonelyRole),
		...perTask(model, bareTask),
		...perTask(model, orphanInputs),
		...perTask(model, deadEndOutputs),
		...perTask(model, silentInterchanges),
		...brokenJourneys(model),
		...perTask(model, inferredFact)
	];
}

type TaskDetector = (model: WorkflowModel, role: WorkflowRole, task: WorkflowTask) => Gap[];

function perRole(model: WorkflowModel, detect: (role: WorkflowRole) => Gap[]): Gap[] {
	return model.roles.flatMap(detect);
}

function perTask(model: WorkflowModel, detect: TaskDetector): Gap[] {
	return model.roles.flatMap((role) => role.tasks.flatMap((task) => detect(model, role, task)));
}

function unnamedBusiness(model: WorkflowModel): Gap[] {
	if (model.businessName !== '') return [];
	return [{ kind: 'UnnamedBusiness' }];
}

function noExternalInputs(model: WorkflowModel): Gap[] {
	if (model.externalInputs.length > 0) return [];
	return [{ kind: 'NoExternalInputs' }];
}

function lonelyRole(role: WorkflowRole): Gap[] {
	if (role.tasks.length >= 2) return [];
	return [{ kind: 'LonelyRole', roleName: role.name }];
}

function bareTask(model: WorkflowModel, role: WorkflowRole, task: WorkflowTask): Gap[] {
	if (task.inputs.length > 0 && task.outputs.length > 0) return [];
	return [{ kind: 'BareTask', roleName: role.name, taskName: task.name }];
}

function orphanInputs(model: WorkflowModel, role: WorkflowRole, task: WorkflowTask): Gap[] {
	return task.inputs
		.filter((input) => !model.externalInputs.includes(input))
		.filter((input) => producersOf(model, input).length === 0)
		.map((input) => ({
			kind: 'OrphanInput' as const,
			roleName: role.name,
			taskName: task.name,
			inputName: input
		}));
}

function deadEndOutputs(model: WorkflowModel, role: WorkflowRole, task: WorkflowTask): Gap[] {
	return task.outputs
		.filter((output) => output !== task.businessOutput)
		.filter((output) => consumersOf(model, output).length === 0)
		.map((output) => ({
			kind: 'DeadEndOutput' as const,
			roleName: role.name,
			taskName: task.name,
			outputName: output
		}));
}

function silentInterchanges(model: WorkflowModel, role: WorkflowRole, task: WorkflowTask): Gap[] {
	return task.handovers
		.filter((handover) => handover.failureNote === undefined)
		.map((handover) => ({
			kind: 'SilentInterchange' as const,
			roleName: role.name,
			taskName: task.name,
			toRole: handover.toRole
		}));
}

function brokenJourneys(model: WorkflowModel): Gap[] {
	return traceJourneys(model)
		.filter((journey) => !journey.isTraceable)
		.map((journey) => ({ kind: 'BrokenJourney' as const, businessOutput: journey.businessOutput }));
}

function inferredFact(model: WorkflowModel, role: WorkflowRole, task: WorkflowTask): Gap[] {
	if (task.provenance === 'stated') return [];
	return [{ kind: 'InferredFact', roleName: role.name, taskName: task.name }];
}
