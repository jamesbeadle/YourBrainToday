import { createHash } from 'node:crypto';

export type ClaimedAuthorizationCode = {
	account_id: string;
	client_id: string;
	redirect_uri: string;
	code_challenge: string;
	expires_at: string;
};

export type AuthorizationCodePresentation = {
	clientId: string;
	redirectUri: string;
	codeVerifier: string;
};

export function isAuthorizationCodeUsable(
	claimedCode: ClaimedAuthorizationCode,
	presentation: AuthorizationCodePresentation
): boolean {
	if (new Date(claimedCode.expires_at).getTime() < Date.now()) return false;
	if (claimedCode.client_id !== presentation.clientId) return false;
	if (presentation.redirectUri !== '' && claimedCode.redirect_uri !== presentation.redirectUri) {
		return false;
	}
	return challengeFor(presentation.codeVerifier) === claimedCode.code_challenge;
}

export function challengeFor(codeVerifier: string): string {
	return createHash('sha256').update(codeVerifier).digest('base64url');
}
