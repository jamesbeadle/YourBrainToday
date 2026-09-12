import { describe, expect, it } from 'vitest';
import { needsClientSecret, readClientRegistration } from './readClientRegistration';

const httpsRedirect = 'https://client.example/callback';

describe('readClientRegistration redirect URIs', () => {
	it('refuses a registration with no redirect URIs', () => {
		expect(readClientRegistration({})).toBeNull();
		expect(readClientRegistration({ redirect_uris: [] })).toBeNull();
		expect(readClientRegistration({ redirect_uris: 'not-a-list' })).toBeNull();
	});

	it('accepts https redirects on any host', () => {
		const registration = readClientRegistration({ redirect_uris: [httpsRedirect] });
		expect(registration?.redirectUris).toEqual([httpsRedirect]);
	});

	it('accepts plain http only on loopback hosts', () => {
		const loopbacks = ['http://localhost:3000/cb', 'http://127.0.0.1/cb', 'http://[::1]:8080/cb'];
		expect(readClientRegistration({ redirect_uris: loopbacks })?.redirectUris).toEqual(loopbacks);
		expect(readClientRegistration({ redirect_uris: ['http://client.example/cb'] })).toBeNull();
	});

	it('drops unparsable and non-web schemes and refuses when none survive', () => {
		expect(readClientRegistration({ redirect_uris: ['not a url', 'ftp://x/y'] })).toBeNull();
		const mixed = readClientRegistration({ redirect_uris: ['not a url', httpsRedirect] });
		expect(mixed?.redirectUris).toEqual([httpsRedirect]);
	});

	it('keeps at most ten redirect URIs', () => {
		const many = Array.from({ length: 12 }, (_, index) => `https://client.example/cb/${index}`);
		expect(readClientRegistration({ redirect_uris: many })?.redirectUris).toHaveLength(10);
	});
});

describe('readClientRegistration client details', () => {
	it('names an anonymous client and trims a long name', () => {
		const anonymous = readClientRegistration({ redirect_uris: [httpsRedirect] });
		expect(anonymous?.clientName).toBe('An MCP client');
		const longName = 'x'.repeat(300);
		const named = readClientRegistration({ redirect_uris: [httpsRedirect], client_name: longName });
		expect(named?.clientName).toHaveLength(200);
	});

	it('falls back to public client authentication for an unsupported method', () => {
		const basic = readClientRegistration({
			redirect_uris: [httpsRedirect],
			token_endpoint_auth_method: 'client_secret_basic'
		});
		expect(basic?.authenticationMethod).toBe('client_secret_basic');
		const unknown = readClientRegistration({
			redirect_uris: [httpsRedirect],
			token_endpoint_auth_method: 'private_key_jwt'
		});
		expect(unknown?.authenticationMethod).toBe('none');
	});

	it('needs a secret for every method but none', () => {
		expect(needsClientSecret('none')).toBe(false);
		expect(needsClientSecret('client_secret_post')).toBe(true);
		expect(needsClientSecret('client_secret_basic')).toBe(true);
	});
});
