import { McpErrorCode, jsonRpcVersion, mcpFailure } from './mcpErrors';
import { describeMcpTools, findMcpTool } from './mcpTools';
import { toolFailureSentence } from './toolFailureSentence';
import {
	latestProtocolVersion,
	listCacheHints,
	negotiateProtocolVersion,
	serverInformation,
	supportedProtocolVersions
} from './mcpProtocol';
import type { McpCaller } from './resolveMcpCaller';
import type { McpRequest } from './readMcpRequest';

type McpAnswer = Record<string, unknown>;

const capabilities = { tools: { listChanged: false } };

const methods: Record<string, (caller: McpCaller, request: McpRequest) => Promise<McpAnswer>> = {
	'server/discover': async () => discovery(),
	ping: async () => ({}),
	initialize: async (_caller, request) => ({
		protocolVersion: negotiateProtocolVersion(request.params.protocolVersion),
		capabilities,
		serverInfo: serverInformation
	}),
	'tools/list': async () => ({ tools: describeMcpTools(), ...listCacheHints }),
	'tools/call': (caller, request) => callTool(caller, request)
};

export async function answerMcpRequest(caller: McpCaller, request: McpRequest) {
	const method = methods[request.method];
	if (method === undefined) {
		return mcpFailure(request.id, McpErrorCode.MethodNotFound, `Unknown method ${request.method}`);
	}
	const result = await method(caller, request);
	return { jsonrpc: jsonRpcVersion, id: request.id, result: { resultType: 'complete', ...result } };
}

function discovery(): McpAnswer {
	return {
		protocolVersions: supportedProtocolVersions,
		latestProtocolVersion,
		capabilities,
		serverInfo: serverInformation
	};
}

async function callTool(caller: McpCaller, request: McpRequest): Promise<McpAnswer> {
	const tool = findMcpTool(request.params.name);
	if (tool === null) {
		return toolAnswer(`There is no tool called ${String(request.params.name)}.`, true);
	}
	const argumentValues = (request.params.arguments ?? {}) as Record<string, unknown>;
	try {
		return toolAnswer(await tool.run(caller, argumentValues), false);
	} catch (failure) {
		console.error(`MCP tool ${tool.name} failed`, failure);
		return toolAnswer(toolFailureSentence(failure), true);
	}
}

function toolAnswer(text: string, isError: boolean): McpAnswer {
	return { content: [{ type: 'text', text }], isError };
}
