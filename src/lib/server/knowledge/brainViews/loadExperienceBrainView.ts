import { getBoundDomainBrainIds } from '../brainBindings';
import { getBrainItems } from '../getBrainItems';
import { brainHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
import { schemaTypesFrom, type BoundSchemaType } from '$lib/data/knowledge/boundSchemaTypes';
import type { KbBrainItem, KbBrainSummary } from '$lib/data/knowledge/knowledgeTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ExperienceBrainView = {
	kind: 'experience';
	brain: KbBrainSummary;
	items: KbBrainItem[];
	domainBrains: KbBrainSummary[];
	boundDomainBrainIds: string[];
	schemaTypes: BoundSchemaType[];
	dddEditorHref: string | null;
};

export async function loadExperienceBrainView(
	supabase: SupabaseClient,
	brain: KbBrainSummary,
	knowledgeBaseBrains: KbBrainSummary[]
): Promise<ExperienceBrainView> {
	const domainBrains = knowledgeBaseBrains.filter((candidate) => candidate.category === 'domain');
	const [items, { boundDomainBrainIds, schemaTypes }] = await Promise.all([
		getBrainItems(supabase, brain.id),
		boundSchemaFor(supabase, brain)
	]);
	return {
		kind: 'experience',
		brain,
		items,
		domainBrains,
		boundDomainBrainIds,
		schemaTypes,
		dddEditorHref: dddEditorHrefFor(brain, domainBrains)
	};
}

/** An instance brain records events in the terms of the expertise brains it is bound to. */
async function boundSchemaFor(
	supabase: SupabaseClient,
	brain: KbBrainSummary
): Promise<{ boundDomainBrainIds: string[]; schemaTypes: BoundSchemaType[] }> {
	if (brain.category !== 'instance') return { boundDomainBrainIds: [], schemaTypes: [] };
	const boundDomainBrainIds = await getBoundDomainBrainIds(supabase, brain.id);
	const itemLists = await Promise.all(
		boundDomainBrainIds.map((domainBrainId) => getBrainItems(supabase, domainBrainId))
	);
	return { boundDomainBrainIds, schemaTypes: schemaTypesFrom(itemLists.flat()) };
}

function dddEditorHrefFor(brain: KbBrainSummary, domainBrains: KbBrainSummary[]): string | null {
	if (brain.domainBrainId === null) return null;
	const expertiseBrain = domainBrains.find(
		(candidate) => candidate.domainBrainId === brain.domainBrainId
	);
	if (expertiseBrain === undefined) return null;
	return brainHref(brain.knowledgeBaseId, expertiseBrain.id);
}
