export const jsonRpcVersion = '2.0';

export const McpErrorCode = {
	ParseError: -32700,
	InvalidRequest: -32600,
	MethodNotFound: -32601,
	InvalidParams: -32602,
	InternalError: -32603
} as const;

export type McpFailure = {
	jsonrpc: typeof jsonRpcVersion;
	id: string | number | null;
	error: { code: number; message: string };
};

export function mcpFailure(
	id: string | number | null,
	code: number,
	message: string
): McpFailure {
	return { jsonrpc: jsonRpcVersion, id, error: { code, message } };
}
