import { sectionIconPaths } from '../../brain/dashboard/railIcons';
import type { DashboardTool } from '../dashboard/dashboardTools.svelte';
import type { KnowledgeKind } from '$lib/data/knowledge/knowledgeKinds';
import type { Snippet } from 'svelte';

export type BrainToolKey = 'ask' | 'draw' | 'model' | 'contents' | 'map' | 'share' | 'settings';

type BrainToolDefinition = { label: string; iconPaths: string[] };

/** Each open brain owns its own registration, so the outgoing view's release never drops the incoming tools. */
export function brainToolsOwnerFor(kind: KnowledgeKind, brainId: string): string {
	return `${kind}-brain-${brainId}`;
}

const brainToolDefinitions: Record<BrainToolKey, BrainToolDefinition> = {
	ask: { label: 'Ask', iconPaths: sectionIconPaths.terminal },
	draw: { label: 'Draw the map', iconPaths: sectionIconPaths.interview },
	model: { label: 'The model', iconPaths: sectionIconPaths.model },
	contents: { label: 'Contents', iconPaths: sectionIconPaths.contents },
	map: { label: 'The map', iconPaths: sectionIconPaths.map },
	share: { label: 'Sharing', iconPaths: sectionIconPaths.share },
	settings: { label: 'Settings', iconPaths: sectionIconPaths.settings }
};

/** A brain view names the tools it offers and the panel behind each; owners get settings too. */
export function brainTools<Key extends BrainToolKey>(
	keys: Key[],
	panels: Record<Key, Snippet>
): DashboardTool[] {
	return keys.map((key) => ({
		key,
		...brainToolDefinitions[key],
		panel: panels[key]
	}));
}

/** Every member gets the view's tools; the owner gets one more, such as settings or sharing. */
export function brainToolKeysFor<Key extends BrainToolKey>(
	memberKeys: Key[],
	ownerKey: Key,
	isOwner: boolean
): Key[] {
	return isOwner ? [...memberKeys, ownerKey] : memberKeys;
}
