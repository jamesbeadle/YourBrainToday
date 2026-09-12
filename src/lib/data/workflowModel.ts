export type WorkflowHandover = {
	toRole: string;
	failureNote?: string;
};

export type WorkflowProvenance = 'stated' | 'inferred';

export type WorkflowTask = {
	name: string;
	summary: string;
	inputs: string[];
	outputs: string[];
	handovers: WorkflowHandover[];
	provenance: WorkflowProvenance;
	businessOutput?: string;
};

export type WorkflowRole = {
	name: string;
	tasks: WorkflowTask[];
};

export type WorkflowModel = {
	businessName: string;
	externalInputs: string[];
	roles: WorkflowRole[];
};

export const emptyWorkflowModel: WorkflowModel = {
	businessName: '',
	externalInputs: [],
	roles: []
};

export function hasMapContent(model: WorkflowModel): boolean {
	return model.roles.some((role) => role.tasks.length > 0);
}

export function allTasks(model: WorkflowModel): WorkflowTask[] {
	return model.roles.flatMap((role) => role.tasks);
}
