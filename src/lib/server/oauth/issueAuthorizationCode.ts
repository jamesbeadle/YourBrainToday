import { authorizationCodeLifetimeSeconds } from './oauthSettings';
import { hashSecret, mintSecret } from './oauthTokens';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { AuthorizationRequest } from './authorizationRequest';

export async function issueAuthorizationCode(
	authorizationRequest: AuthorizationRequest,
	accountId: string
): Promise<string> {
	const code = mintSecret('ybt_ac_');
	const { error } = await supabaseServiceClient()
		.from('oauth_authorization_codes')
		.insert({
			code_hash: hashSecret(code),
			client_id: authorizationRequest.clientId,
			account_id: accountId,
			redirect_uri: authorizationRequest.redirectUri,
			code_challenge: authorizationRequest.codeChallenge,
			expires_at: new Date(Date.now() + authorizationCodeLifetimeSeconds * 1000).toISOString()
		});
	if (error) throw error;
	return code;
}

export function redirectBackWithCode(
	authorizationRequest: AuthorizationRequest,
	code: string
): string {
	const destination = new URL(authorizationRequest.redirectUri);
	destination.searchParams.set('code', code);
	if (authorizationRequest.state !== '') {
		destination.searchParams.set('state', authorizationRequest.state);
	}
	return destination.toString();
}

export function redirectBackWithRefusal(authorizationRequest: AuthorizationRequest): string {
	const destination = new URL(authorizationRequest.redirectUri);
	destination.searchParams.set('error', 'access_denied');
	if (authorizationRequest.state !== '') {
		destination.searchParams.set('state', authorizationRequest.state);
	}
	return destination.toString();
}
