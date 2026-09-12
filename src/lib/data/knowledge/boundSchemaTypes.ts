import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

export type BoundSchemaType = { typeName: string; properties: string[] };

export function schemaTypesFrom(boundDomainItems: KbBrainItem[]): BoundSchemaType[] {
	return boundDomainItems
		.filter((item) => item.itemKind === 'node_type')
		.map((item) => ({ typeName: item.title, properties: propertiesFrom(item) }));
}

function propertiesFrom(item: KbBrainItem): string[] {
	const properties = item.data.properties;
	if (typeof properties !== 'string') return [];
	return properties
		.split(',')
		.map((property) => property.trim())
		.filter((property) => property !== '');
}
