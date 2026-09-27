import { findWarmth, humanItemKinds } from '$lib/data/knowledge/humanConnections';
import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

export const humanQueryGuidance = `When asked how to approach someone or handle a situation involving
people, reason over the relationships: prefer a route through close or warm connections, name
who could make the introduction, and warn where a connection runs cool or hostile.`;

export function humanRecordFrame(item: KbBrainItem): string {
	if (item.itemKind === humanItemKinds.person) return personFrame(item);
	if (item.itemKind === humanItemKinds.connection) return connectionFrame(item);
	return '';
}

function personFrame(item: KbBrainItem): string {
	const fields = ['role', 'organisation']
		.map((key) => [key, item.data[key]])
		.filter(([, value]) => typeof value === 'string' && value !== '')
		.map(([key, value]) => `${key}: ${value}`);
	return fields.length === 0 ? '' : `— ${fields.join('; ')}`;
}

function connectionFrame(item: KbBrainItem): string {
	const warmth = findWarmth(String(item.data.warmth ?? ''));
	return `— between ${item.data.from} and ${item.data.to}; warmth: ${warmth.label} (${warmth.meaning})`;
}
