import { accountActions } from './actions/accountActions';
import type { ActionArea, McpAction } from './actionTypes';
import type { AccountStanding } from './resolveAccountStanding';

const everyAction: McpAction[] = [...accountActions];

export function actionsFor(standing: AccountStanding, area: ActionArea | null): McpAction[] {
	return everyAction
		.filter((action) => isForAudience(action, standing))
		.filter((action) => area === null || action.area === area)
		.sort((left, right) => left.name.localeCompare(right.name));
}

export function findAction(name: string, standing: AccountStanding): McpAction | null {
	return actionsFor(standing, null).find((action) => action.name === name) ?? null;
}

export function areasFor(standing: AccountStanding): ActionArea[] {
	return [...new Set(actionsFor(standing, null).map((action) => action.area))];
}

function isForAudience(action: McpAction, standing: AccountStanding): boolean {
	if (action.audience === 'everyone') return true;
	if (action.audience === 'admin') return standing.isAdmin;
	return action.audience === standing.role;
}
