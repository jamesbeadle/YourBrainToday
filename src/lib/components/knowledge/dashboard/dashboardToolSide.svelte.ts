import { untrack, type Snippet } from 'svelte';

export type DashboardTool = {
	key: string;
	label: string;
	iconPaths: string[];
	panel: Snippet;
};

type ToolRegistration = { owner: string; tools: DashboardTool[] };

/**
 * One side of the dashboard: the tools on show there and which panel is open.
 * Whoever owns a set of tools registers it, and the latest registration is the
 * one on show, so an incoming brain's tools stand whichever order the outgoing
 * brain releases in. Registering happens inside the owners' effects, so the
 * registry writes untracked to keep those effects from re-running on their
 * own writes.
 */
export class DashboardToolSide {
	#registrations = $state<ToolRegistration[]>([]);
	#onOpen: () => void;
	activeKey = $state<string | null>(null);

	constructor(onOpen: () => void = () => {}) {
		this.#onOpen = onOpen;
	}

	get tools(): DashboardTool[] {
		const latest = this.#registrations.at(-1);
		return latest === undefined ? [] : latest.tools;
	}

	get activeTool(): DashboardTool | null {
		return this.tools.find((tool) => tool.key === this.activeKey) ?? null;
	}

	get hasOpenPanel(): boolean {
		return this.activeTool !== null;
	}

	register(owner: string, tools: DashboardTool[]): void {
		untrack(() => {
			this.#registrations = [...this.withoutOwner(owner), { owner, tools }];
			this.closeIfGone();
		});
	}

	release(owner: string): void {
		untrack(() => {
			this.#registrations = this.withoutOwner(owner);
			this.closeIfGone();
		});
	}

	open(key: string | null): void {
		this.activeKey = key;
		if (key !== null) this.#onOpen();
	}

	toggle(key: string): void {
		this.open(this.activeKey === key ? null : key);
	}

	close(): void {
		this.activeKey = null;
	}

	private withoutOwner(owner: string): ToolRegistration[] {
		return this.#registrations.filter((registration) => registration.owner !== owner);
	}

	private closeIfGone(): void {
		if (this.activeTool === null) this.activeKey = null;
	}
}
