import { traitsFor, type ModelTraits } from '$lib/data/modelTraits';

export type ToolDemand = { forcedToolName?: string; mustUseTool?: boolean };

type ShapedRequest = {
	system: string;
	max_tokens: number;
	tool_choice?: Record<string, unknown>;
	output_config?: Record<string, unknown>;
};

export function shapeRequestForModel(
	modelId: string,
	request: ToolDemand & { system: string; maxTokens: number }
): ShapedRequest {
	const traits = traitsFor(modelId);
	return {
		system: systemFor(request, traits),
		max_tokens: request.maxTokens + traits.thinkingHeadroomTokens,
		...toolChoiceFor(request, traits),
		...(traits.effort === null ? {} : { output_config: { effort: traits.effort } })
	};
}

function toolChoiceFor(demand: ToolDemand, traits: ModelTraits): Partial<ShapedRequest> {
	if (!traits.canForceToolUse) return {};
	if (demand.forcedToolName !== undefined) {
		return { tool_choice: { type: 'tool', name: demand.forcedToolName } };
	}
	if (demand.mustUseTool === true) return { tool_choice: { type: 'any' } };
	return {};
}

function systemFor(request: ToolDemand & { system: string }, traits: ModelTraits): string {
	if (traits.canForceToolUse) return request.system;
	const instruction = toolInstructionFor(request);
	if (instruction === null) return request.system;
	return `${request.system}\n\n${instruction}`;
}

function toolInstructionFor(demand: ToolDemand): string | null {
	if (demand.forcedToolName !== undefined) {
		return `Reply only by calling the ${demand.forcedToolName} tool — never in plain prose.`;
	}
	if (demand.mustUseTool === true) return 'Reply only by calling one of your tools — never in plain prose.';
	return null;
}
