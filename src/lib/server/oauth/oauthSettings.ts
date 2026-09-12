import { supportedClientAuthenticationMethods } from './readClientRegistration';

export const protectedResourcePath = '/api/mcp';
export const authorizePath = '/oauth/authorize';
export const tokenPath = '/oauth/token';
export const registrationPath = '/oauth/register';

export const accessTokenLifetimeSeconds = 3600;
export const refreshTokenLifetimeSeconds = 5_184_000;
export const authorizationCodeLifetimeSeconds = 300;

export const supportedScope = 'ybt';
export const supportedCodeChallengeMethod = 'S256';

export function authorizationServerMetadata(origin: string): Record<string, unknown> {
	return {
		issuer: origin,
		authorization_endpoint: `${origin}${authorizePath}`,
		token_endpoint: `${origin}${tokenPath}`,
		registration_endpoint: `${origin}${registrationPath}`,
		scopes_supported: [supportedScope],
		response_types_supported: ['code'],
		grant_types_supported: ['authorization_code', 'refresh_token'],
		code_challenge_methods_supported: [supportedCodeChallengeMethod],
		token_endpoint_auth_methods_supported: supportedClientAuthenticationMethods
	};
}

export function protectedResourceMetadata(origin: string): Record<string, unknown> {
	return {
		resource: `${origin}${protectedResourcePath}`,
		authorization_servers: [origin],
		scopes_supported: [supportedScope],
		bearer_methods_supported: ['header']
	};
}
