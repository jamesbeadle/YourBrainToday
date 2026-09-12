import { describe, expect, it } from 'vitest';
import { DashboardTools, type DashboardTool } from './dashboardTools.svelte';
import type { Snippet } from 'svelte';

const noPanel = (() => {}) as unknown as Snippet;

function tool(key: string): DashboardTool {
	return { key, label: key, iconPaths: [], panel: noPanel };
}

function keysOf(tools: DashboardTool[]): string[] {
	return tools.map((candidate) => candidate.key);
}

const knowledgeBaseTools = [tool('interview'), tool('documents')];
const brainTools = [tool('ask'), tool('model')];

const wideScreen = () => false;
const phone = () => true;

describe('DashboardTools', () => {
	it('keeps the knowledge base tools on the left and the brain tools on the right', () => {
		const dashboardTools = new DashboardTools(wideScreen);
		dashboardTools.left.register('knowledge-base', knowledgeBaseTools);
		dashboardTools.right.register('brain', brainTools);
		expect(keysOf(dashboardTools.left.tools)).toEqual(['interview', 'documents']);
		expect(keysOf(dashboardTools.right.tools)).toEqual(['ask', 'model']);
	});

	it('shows the latest registration on a side whichever order the owners release in', () => {
		const dashboardTools = new DashboardTools(wideScreen);
		dashboardTools.right.register('expertise-brain-1', brainTools);
		dashboardTools.right.register('process-brain-2', [tool('map')]);
		dashboardTools.right.release('expertise-brain-1');
		expect(keysOf(dashboardTools.right.tools)).toEqual(['map']);
	});

	it('closes the open panel when its tool is no longer on show', () => {
		const dashboardTools = new DashboardTools(wideScreen);
		dashboardTools.right.register('brain', brainTools);
		dashboardTools.right.open('ask');
		dashboardTools.right.release('brain');
		expect(dashboardTools.right.activeKey).toBeNull();
		expect(dashboardTools.right.tools).toEqual([]);
	});

	it('lets a panel stand on each side of a wide screen', () => {
		const dashboardTools = new DashboardTools(wideScreen);
		dashboardTools.left.register('knowledge-base', knowledgeBaseTools);
		dashboardTools.right.register('brain', brainTools);
		dashboardTools.left.open('interview');
		dashboardTools.right.toggle('ask');
		expect(dashboardTools.left.activeKey).toBe('interview');
		expect(dashboardTools.right.activeKey).toBe('ask');
	});

	it('opens one panel at a time where there is room for one only', () => {
		const dashboardTools = new DashboardTools(phone);
		dashboardTools.left.register('knowledge-base', knowledgeBaseTools);
		dashboardTools.right.register('brain', brainTools);
		dashboardTools.left.open('interview');
		dashboardTools.right.toggle('ask');
		expect(dashboardTools.left.activeKey).toBeNull();
		expect(dashboardTools.right.activeKey).toBe('ask');
		expect(dashboardTools.hasOpenPanel).toBe(true);
	});

	it('toggles a tool shut without touching the other side', () => {
		const dashboardTools = new DashboardTools(phone);
		dashboardTools.left.register('knowledge-base', knowledgeBaseTools);
		dashboardTools.left.open('interview');
		dashboardTools.left.toggle('interview');
		expect(dashboardTools.hasOpenPanel).toBe(false);
	});
});
