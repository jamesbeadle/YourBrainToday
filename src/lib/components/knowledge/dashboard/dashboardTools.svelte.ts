import { DashboardToolSide } from './dashboardToolSide.svelte';
import { getContext, setContext } from 'svelte';

export type { DashboardTool } from './dashboardToolSide.svelte';

export type ToolSide = 'left' | 'right';

/**
 * The knowledge base's tools live on the left rail and an open brain's tools
 * top-right; each side keeps its own panel, and a wide screen shows one panel
 * per side at once. Where there is room for one panel only, opening a panel
 * on either side closes the other's.
 */
export class DashboardTools {
	#hasRoomForOnePanelOnly: () => boolean;
	left = new DashboardToolSide(() => this.makeRoomBeside(this.right));
	right = new DashboardToolSide(() => this.makeRoomBeside(this.left));

	constructor(hasRoomForOnePanelOnly: () => boolean = () => false) {
		this.#hasRoomForOnePanelOnly = hasRoomForOnePanelOnly;
	}

	side(side: ToolSide): DashboardToolSide {
		return side === 'left' ? this.left : this.right;
	}

	get hasOpenPanel(): boolean {
		return this.left.hasOpenPanel || this.right.hasOpenPanel;
	}

	private makeRoomBeside(other: DashboardToolSide): void {
		if (this.#hasRoomForOnePanelOnly()) other.close();
	}
}

const dashboardToolsKey = Symbol('dashboardTools');

export function provideDashboardTools(hasRoomForOnePanelOnly: () => boolean): DashboardTools {
	return setContext(dashboardToolsKey, new DashboardTools(hasRoomForOnePanelOnly));
}

export function useDashboardTools(): DashboardTools {
	return getContext<DashboardTools>(dashboardToolsKey);
}
