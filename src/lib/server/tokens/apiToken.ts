import { createHash, randomBytes } from 'node:crypto';

const tokenPrefix = 'ybt_';
const tokenBytes = 24;
const hintLength = 4;

export function hashApiToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

export function mintApiToken(): { token: string; tokenHash: string; tokenHint: string } {
	const token = `${tokenPrefix}${randomBytes(tokenBytes).toString('hex')}`;
	return { token, tokenHash: hashApiToken(token), tokenHint: token.slice(-hintLength) };
}

export function bearerToken(request: Request): string {
	const header = request.headers.get('authorization') ?? '';
	if (!header.toLowerCase().startsWith('bearer ')) return '';
	return header.slice('bearer '.length).trim();
}
