import { derivePhase } from './interview/derivePhase';
import { findGaps } from './interview/findGaps';
import { rankGaps } from './interview/rankGaps';
import { traceJourneys } from './interview/traceJourneys';
import type { InterviewState } from './interview/gapTypes';
import type { WorkflowModel } from '$lib/data/workflowModel';

export function deriveInterviewState(model: WorkflowModel): InterviewState {
	const gaps = findGaps(model);
	const phase = derivePhase(model, gaps);
	const journeys = traceJourneys(model);
	return { phase, rankedGaps: rankGaps(model, phase, gaps, journeys) };
}
