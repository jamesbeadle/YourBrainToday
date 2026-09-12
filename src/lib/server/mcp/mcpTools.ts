import { describeAction, listActions } from './browseActions';
import { describeContext } from './describeContext';
import { runAction } from './runAction';
import type { McpCaller } from './resolveMcpCaller';

export type McpTool = {
	name: string;
	title: string;
	description: string;
	inputSchema: Record<string, unknown>;
	run: (caller: McpCaller, argumentValues: Record<string, unknown>) => Promise<string>;
};

const areaField = {
	type: 'string',
	description: 'Narrow to one area, as named by get_current_context'
};

export const mcpTools: McpTool[] = [
	{
		name: 'get_current_context',
		title: 'Who you are here',
		description:
			'Start here. Says who the signed-in person is, whether they are staff or a client ' +
			'contact, and which areas of Your Brain Today they can reach.',
		inputSchema: { type: 'object', properties: {}, additionalProperties: false },
		run: async (caller) => describeContext(caller)
	},
	{
		name: 'list_actions',
		title: 'List everything you can do',
		description:
			'Every action this person may run, with a one-line summary each. Anything the site ' +
			'lets them do is here. Call describe_action before running one you have not run before.',
		inputSchema: { type: 'object', properties: { area: areaField }, additionalProperties: false },
		run: async (caller, argumentValues) => listActions(caller, argumentValues)
	},
	{
		name: 'describe_action',
		title: 'Read one action in full',
		description:
			'The input an action takes and any doctrine attached to it. Read this before running ' +
			'an action that writes.',
		inputSchema: {
			type: 'object',
			properties: { name: { type: 'string', description: 'The action name' } },
			required: ['name'],
			additionalProperties: false
		},
		run: async (caller, argumentValues) => describeAction(caller, argumentValues)
	},
	{
		name: 'perform_action',
		title: 'Run one action',
		description:
			'Run an action by name with its input. Writes are recorded under the signed-in ' +
			'person, exactly as if they had done it on the site.',
		inputSchema: {
			type: 'object',
			properties: {
				name: { type: 'string', description: 'The action name' },
				input: { type: 'object', description: 'The action input, per describe_action' }
			},
			required: ['name'],
			additionalProperties: false
		},
		run: async (caller, argumentValues) =>
			runAction(
				caller,
				String(argumentValues.name ?? ''),
				(argumentValues.input ?? {}) as Record<string, unknown>
			)
	}
];

export function findMcpTool(name: unknown): McpTool | null {
	return mcpTools.find((tool) => tool.name === name) ?? null;
}

export function describeMcpTools(): Record<string, unknown>[] {
	return mcpTools.map((tool) => ({
		name: tool.name,
		title: tool.title,
		description: tool.description,
		inputSchema: tool.inputSchema
	}));
}
