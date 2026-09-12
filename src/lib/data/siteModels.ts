import { cheapestModelId, isKnownModel, modelLadder } from './modelLadder';

export type SiteModelChoice = { modelId: string; label: string };

export const defaultSiteModel = cheapestModelId;

export const siteModelChoices: SiteModelChoice[] = modelLadder.map((rung) => ({
	modelId: rung.modelId,
	label: `Claude ${rung.name} — ${rung.tagline}`
}));

export function isKnownSiteModel(modelId: string): boolean {
	return isKnownModel(modelId);
}
