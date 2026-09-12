import { clipPromptSection, clipPromptText } from './clipPromptText';
import { traceJourneys, type Journey } from '../agent/interview/traceJourneys';
import { chatbotKnowledgeCaps } from '$lib/data/chatbotKnowledgeCaps';
import type { ChatbotProcessMap } from './getChatbotProcessMaps';
import type { WorkflowHandover, WorkflowRole, WorkflowTask } from '$lib/data/workflowModel';

const { mostTasksPerRole, longestTaskSummary, longestProcessSection } = chatbotKnowledgeCaps;

const truncationNote = '(The rest of the process map is not shown.)';

export function renderChatbotProcess(processMaps: ChatbotProcessMap[]): string {
	if (processMaps.length === 0) return 'The process map has not been drawn yet.';
	const rendered = processMaps.map(renderMap).join('\n\n');
	return clipPromptSection(rendered, longestProcessSection, truncationNote);
}

function renderMap(processMap: ChatbotProcessMap): string {
	const { model } = processMap;
	const externalInputs =
		model.externalInputs.length === 0 ? 'nothing recorded' : model.externalInputs.join(', ');
	return [
		`### Process map: ${processMap.name}`,
		`Business: ${model.businessName || processMap.name}`,
		`Comes in from outside: ${externalInputs}`,
		...model.roles.map(renderRole),
		renderJourneys(traceJourneys(model))
	].join('\n');
}

function renderRole(role: WorkflowRole): string {
	const shown = role.tasks.slice(0, mostTasksPerRole).map(renderTask);
	const hidden = role.tasks.length - shown.length;
	if (hidden > 0) shown.push(`- …and ${hidden} more tasks for this role.`);
	return [`#### Role: ${role.name}`, ...shown].join('\n');
}

function renderTask(task: WorkflowTask): string {
	const parts = [`- ${task.name} — ${clipPromptText(task.summary, longestTaskSummary)}`];
	if (task.inputs.length > 0) parts.push(`Takes: ${task.inputs.join(', ')}.`);
	if (task.outputs.length > 0) parts.push(`Produces: ${task.outputs.join(', ')}.`);
	if (task.handovers.length > 0) parts.push(`Hands to: ${task.handovers.map(renderHandover).join('; ')}.`);
	if (task.businessOutput !== undefined) parts.push(`Delivers the business output: ${task.businessOutput}.`);
	return parts.join(' ');
}

function renderHandover(handover: WorkflowHandover): string {
	if (handover.failureNote === undefined) return handover.toRole;
	return `${handover.toRole} (if it fails: ${handover.failureNote})`;
}

function renderJourneys(journeys: Journey[]): string {
	if (journeys.length === 0) return 'Journeys: no business outputs are marked yet.';
	return ['Journeys to business outputs (the tasks each one passes through):', ...journeys.map(renderJourney)].join('\n');
}

function renderJourney(journey: Journey): string {
	const trace = journey.isTraceable ? '' : ' [not yet traced back to an outside input]';
	const tasksInWorkingOrder = [...journey.taskNamesOnPath].reverse();
	return `- ${journey.businessOutput}: ${tasksInWorkingOrder.join(' → ')}${trace}`;
}
