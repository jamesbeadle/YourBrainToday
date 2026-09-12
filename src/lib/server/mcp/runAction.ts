import { findAction } from './actionRegistry';
import type { McpCaller } from './resolveMcpCaller';

export async function runAction(
	caller: McpCaller,
	name: string,
	input: Record<string, unknown>
): Promise<string> {
	const action = findAction(name, caller);
	if (action === null) {
		return `There is no action called ${name} that you can run. Call list_actions to see what you can do.`;
	}
	return action.run(caller, input);
}
