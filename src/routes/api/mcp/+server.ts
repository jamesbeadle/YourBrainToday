import { json } from '@sveltejs/kit';
import { McpErrorCode, mcpFailure } from '$lib/server/mcp/mcpErrors';
import { answerMcpRequest } from '$lib/server/mcp/mcpMethods';
import { isNotification, readMcpRequest, type McpRequest } from '$lib/server/mcp/readMcpRequest';
import { protectedResourcePath } from '$lib/server/oauth/oauthSettings';
import { resolveMcpCaller } from '$lib/server/mcp/resolveMcpCaller';
import type { RequestHandler } from './$types';

export const config = { maxDuration: 300 };

const acknowledged = 202;
const unauthorised = 401;
const methodNotAllowed = 405;

export const POST: RequestHandler = async ({ request, url }) => {
	const payload = await request.json().catch(() => undefined);
	const mcpRequest = payload === undefined ? null : readMcpRequest(payload);
	try {
		return await answer(request, url.origin, payload, mcpRequest);
	} catch (failure) {
		console.error('MCP request failed', failure);
		return json(
			mcpFailure(mcpRequest?.id ?? null, McpErrorCode.InternalError, 'Something went wrong on our side. Try again shortly.')
		);
	}
};

export const GET: RequestHandler = async () =>
	new Response('This endpoint only answers JSON-RPC over POST.', { status: methodNotAllowed });

async function answer(
	request: Request,
	origin: string,
	payload: unknown,
	mcpRequest: McpRequest | null
): Promise<Response> {
	const caller = await resolveMcpCaller(request);
	if (caller === null) return askForAuthorisation(origin);
	if (payload === undefined) {
		return json(mcpFailure(null, McpErrorCode.ParseError, 'The body is not JSON'));
	}
	if (mcpRequest === null) {
		return json(mcpFailure(null, McpErrorCode.InvalidRequest, 'That is not a JSON-RPC request'));
	}
	if (isNotification(mcpRequest)) return new Response(null, { status: acknowledged });
	return json(await answerMcpRequest(caller, mcpRequest));
}

function askForAuthorisation(origin: string): Response {
	const metadataUrl = `${origin}/.well-known/oauth-protected-resource${protectedResourcePath}`;
	return new Response('Connect through OAuth, or send a client access token as a bearer token.', {
		status: unauthorised,
		headers: { 'WWW-Authenticate': `Bearer resource_metadata="${metadataUrl}"` }
	});
}
