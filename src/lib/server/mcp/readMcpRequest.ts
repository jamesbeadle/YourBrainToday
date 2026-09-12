export type McpRequest = {
	id: string | number | null;
	method: string;
	params: Record<string, unknown>;
};

export function readMcpRequest(payload: unknown): McpRequest | null {
	if (typeof payload !== 'object' || payload === null) return null;
	const message = payload as Record<string, unknown>;
	if (typeof message.method !== 'string') return null;
	return {
		id: readIdentifier(message.id),
		method: message.method,
		params: readParams(message.params)
	};
}

export function isNotification(request: McpRequest): boolean {
	return request.id === null;
}

function readIdentifier(value: unknown): string | number | null {
	if (typeof value === 'string' || typeof value === 'number') return value;
	return null;
}

function readParams(value: unknown): Record<string, unknown> {
	if (typeof value !== 'object' || value === null) return {};
	return value as Record<string, unknown>;
}
