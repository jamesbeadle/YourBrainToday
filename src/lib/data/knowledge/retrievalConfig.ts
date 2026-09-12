import { defaultRetrievalConfigFor } from './brainTypeCatalog';
import type { BrainType, RetrievalConfig, RetrievalPipeline } from './knowledgeTypes';

export function parseRetrievalConfig(
	brainType: BrainType,
	stored: Record<string, unknown> | null
): RetrievalConfig {
	const defaults = defaultRetrievalConfigFor(brainType);
	if (stored === null) return defaults;
	return {
		pipeline: pipelineFrom(stored.pipeline, defaults.pipeline),
		topK: numberFrom(stored.topK, defaults.topK),
		traversalDepth: numberFrom(stored.traversalDepth, defaults.traversalDepth),
		recencyWeight: numberFrom(stored.recencyWeight, defaults.recencyWeight)
	};
}

function pipelineFrom(value: unknown, fallback: RetrievalPipeline): RetrievalPipeline {
	return typeof value === 'string' ? (value as RetrievalPipeline) : fallback;
}

function numberFrom(value: unknown, fallback: number): number {
	return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}
