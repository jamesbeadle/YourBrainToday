import { findOauthClient, type OauthClient } from './authorizationRequest';
import { hashSecret } from './oauthTokens';

export type ClientAuthenticationFailure = 'invalid_client';

export async function authenticateOauthClient(
	clientId: string,
	clientSecret: string
): Promise<OauthClient | ClientAuthenticationFailure> {
	if (clientId === '') return 'invalid_client';
	const client = await findOauthClient(clientId);
	if (client === null) return 'invalid_client';
	if (client.clientSecretHash === null) return client;
	if (hashSecret(clientSecret) === client.clientSecretHash) return client;
	return 'invalid_client';
}
