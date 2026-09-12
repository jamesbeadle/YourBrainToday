import type { DomainBlockKind } from './brainTypes';

export const domainBlockOrder: DomainBlockKind[] = [
	'entity',
	'value_object',
	'aggregate',
	'domain_service',
	'domain_event',
	'glossary',
	'context_map'
];

export const domainBlockLabels: Record<DomainBlockKind, { singular: string; plural: string }> = {
	entity: { singular: 'Entity', plural: 'Entities' },
	value_object: { singular: 'Value object', plural: 'Value objects' },
	aggregate: { singular: 'Aggregate', plural: 'Aggregates' },
	domain_service: { singular: 'Domain service', plural: 'Domain services' },
	domain_event: { singular: 'Domain event', plural: 'Domain events' },
	glossary: { singular: 'Glossary', plural: 'Glossaries' },
	context_map: { singular: 'Context map', plural: 'Context maps' }
};

export function isDomainBlockKind(candidate: string): candidate is DomainBlockKind {
	return candidate in domainBlockLabels;
}
