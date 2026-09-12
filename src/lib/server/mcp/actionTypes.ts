import type { McpCaller } from './resolveMcpCaller';

export type ActionArea = 'account' | 'knowledge-bases' | 'brains' | 'chatbots';

export type ActionAudience = 'owner' | 'admin' | 'everyone';

export type McpAction = {
	name: string;
	area: ActionArea;
	audience: ActionAudience;
	isWrite: boolean;
	summary: string;
	guidance?: string;
	inputSchema: Record<string, unknown>;
	run: (caller: McpCaller, input: Record<string, unknown>) => Promise<string>;
};

export function readText(input: Record<string, unknown>, field: string): string {
	return String(input[field] ?? '').trim();
}

export function readOptionalText(input: Record<string, unknown>, field: string): string | null {
	const value = readText(input, field);
	if (value === '') return null;
	return value;
}

export function objectSchema(
	properties: Record<string, unknown>,
	required: string[] = []
): Record<string, unknown> {
	return { type: 'object', properties, required, additionalProperties: false };
}

export const textField = (description: string) => ({ type: 'string', description });
