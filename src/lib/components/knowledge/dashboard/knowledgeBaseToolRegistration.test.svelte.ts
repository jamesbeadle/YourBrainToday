import { describe, expect, it } from 'vitest';
import { DashboardTools } from './dashboardTools.svelte';
import type { DashboardToolSide } from './dashboardToolSide.svelte';
import { registerKnowledgeBaseTools } from './knowledgeBaseToolRegistration.svelte';
import { knowledgeBaseToolDefinitions, type KnowledgeBaseToolKey } from './knowledgeBaseTools';
import { flushSync, type Snippet } from 'svelte';

const noPanel = (() => {}) as unknown as Snippet;

const panels = Object.fromEntries(
	Object.keys(knowledgeBaseToolDefinitions).map((key) => [key, noPanel])
) as Record<KnowledgeBaseToolKey, Snippet>;

type MountedToolset = {
	railTools: DashboardToolSide;
	refreshPageData: (isOwner: boolean) => void;
	unmount: () => void;
};

/** The toolset reads the role the way a component reads a prop: straight off the page data. */
function mountToolset(): MountedToolset {
	const railTools = new DashboardTools().left;
	let pageData = $state({ isOwner: true });
	const unmount = $effect.root(() => {
		registerKnowledgeBaseTools(railTools, () => pageData.isOwner, panels);
	});
	flushSync();
	const refreshPageData = (isOwner: boolean) => {
		pageData = { isOwner };
		flushSync();
	};
	return { railTools, refreshPageData, unmount };
}

describe('registerKnowledgeBaseTools', () => {
	it('keeps the open panel when the page data is refreshed and the role is unchanged', () => {
		const { railTools, refreshPageData, unmount } = mountToolset();
		railTools.open('documents');
		refreshPageData(true);
		expect(railTools.activeKey).toBe('documents');
		unmount();
	});

	it('takes the owner tools away when the role changes to viewer', () => {
		const { railTools, refreshPageData, unmount } = mountToolset();
		railTools.open('documents');
		refreshPageData(false);
		expect(railTools.activeKey).toBeNull();
		expect(railTools.tools.map((tool) => tool.key)).toEqual(['interview', 'log']);
		unmount();
	});

	it('takes the tools off the rail when the toolset unmounts', () => {
		const { railTools, unmount } = mountToolset();
		unmount();
		expect(railTools.tools).toEqual([]);
	});
});
