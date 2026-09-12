export const serverInformation = {
	name: 'your-brain-today',
	title: 'Your Brain Today',
	version: '1.0.0'
} as const;

export const latestProtocolVersion = '2026-07-28';

export const supportedProtocolVersions = [
	latestProtocolVersion,
	'2025-11-25',
	'2025-06-18',
	'2025-03-26'
];

const listCacheLifetimeMilliseconds = 300_000;

export const listCacheHints = {
	ttlMs: listCacheLifetimeMilliseconds,
	cacheScope: 'private'
} as const;

export function negotiateProtocolVersion(requested: unknown): string {
	if (typeof requested !== 'string') return latestProtocolVersion;
	if (supportedProtocolVersions.includes(requested)) return requested;
	return latestProtocolVersion;
}
