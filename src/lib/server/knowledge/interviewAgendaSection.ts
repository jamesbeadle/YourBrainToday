import { deriveInterviewState } from '$lib/server/agent/deriveInterviewState';
import { renderAgenda } from '$lib/server/agent/interview/renderAgenda';
import type { WorkflowModel } from '$lib/data/workflowModel';

export function interviewAgendaSection(processMap: WorkflowModel | null): string {
	if (processMap === null) return '';
	const agenda = renderAgenda(deriveInterviewState(processMap));
	return `
${agenda}

## Process map rules

- When the owner's latest answer says anything about how work moves — a role, a task, what
  it takes or produces, who it hands to, what goes wrong at a handover — return the complete
  updated Process Map model as map. Omit map when the answer adds nothing to it.
- Keep every existing role and task; refine them, never delete.
- Task names are short and start with a verb. Summaries are one sentence. Inputs and
  outputs are short noun phrases.
- When a task consumes another task's output, write the input using the IDENTICAL phrase
  as that output — matching names are the edges of the map.
- handovers on a task lists only roles that exist in the model; record what goes wrong at
  one as its failureNote in the owner's words.
- provenance is 'inferred' for anything you concluded yourself and 'stated' once the owner
  has said or confirmed it.
- externalInputs lists what arrives from outside and starts work off; businessOutput is set
  only when a customer, supplier or regulator receives the thing.

## Current Process Map model

${JSON.stringify(processMap)}`;
}
