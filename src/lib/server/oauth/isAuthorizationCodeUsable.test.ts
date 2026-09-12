import { describe, expect, it } from 'vitest';
import { challengeFor, isAuthorizationCodeUsable } from './isAuthorizationCodeUsable';

const codeVerifier = 'a-long-random-verifier-string-from-the-client';
const oneHourMilliseconds = 60 * 60 * 1000;

function claimedCode(overrides: Partial<Parameters<typeof isAuthorizationCodeUsable>[0]> = {}) {
	return {
		account_id: 'account-1',
		client_id: 'client-1',
		redirect_uri: 'https://client.example/callback',
		code_challenge: challengeFor(codeVerifier),
		expires_at: new Date(Date.now() + oneHourMilliseconds).toISOString(),
		...overrides
	};
}

const matchingPresentation = {
	clientId: 'client-1',
	redirectUri: 'https://client.example/callback',
	codeVerifier
};

describe('isAuthorizationCodeUsable', () => {
	it('accepts a live code presented by its client with the right verifier', () => {
		expect(isAuthorizationCodeUsable(claimedCode(), matchingPresentation)).toBe(true);
	});

	it('refuses an expired code', () => {
		const expired = claimedCode({
			expires_at: new Date(Date.now() - oneHourMilliseconds).toISOString()
		});
		expect(isAuthorizationCodeUsable(expired, matchingPresentation)).toBe(false);
	});

	it('refuses a code presented by another client', () => {
		const presentation = { ...matchingPresentation, clientId: 'client-2' };
		expect(isAuthorizationCodeUsable(claimedCode(), presentation)).toBe(false);
	});

	it('refuses a mismatched redirect but allows the redirect to be omitted', () => {
		const wrongRedirect = { ...matchingPresentation, redirectUri: 'https://other.example/cb' };
		expect(isAuthorizationCodeUsable(claimedCode(), wrongRedirect)).toBe(false);
		const omitted = { ...matchingPresentation, redirectUri: '' };
		expect(isAuthorizationCodeUsable(claimedCode(), omitted)).toBe(true);
	});

	it('refuses a verifier that does not hash to the challenge', () => {
		const presentation = { ...matchingPresentation, codeVerifier: 'some-other-verifier' };
		expect(isAuthorizationCodeUsable(claimedCode(), presentation)).toBe(false);
	});

	it('derives the challenge as the base64url sha256 of the verifier', () => {
		expect(challengeFor('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')).toMatch(/^[A-Za-z0-9_-]{43}$/);
		expect(challengeFor(codeVerifier)).toBe(challengeFor(codeVerifier));
	});
});
