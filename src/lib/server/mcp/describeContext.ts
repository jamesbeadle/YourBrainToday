import { actionsFor, areasFor } from './actionRegistry';
import type { McpCaller } from './resolveMcpCaller';

export function describeContext(caller: McpCaller): string {
	return [
		`Signed in as ${caller.email}.`,
		standingLine(caller),
		`Areas you can reach: ${areasFor(caller).join(', ')}.`,
		`${actionsFor(caller, null).length} actions are available to you — call list_actions to see them.`
	].join('\n');
}

function standingLine(caller: McpCaller): string {
	if (caller.isAdmin) return 'You are an administrator of Your Brain Today.';
	return 'You are an account holder here, and can reach the knowledge bases you own.';
}
