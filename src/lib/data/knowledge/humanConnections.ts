export const humanItemKinds = { person: 'person', connection: 'connection' } as const;

export type Warmth = 'close' | 'warm' | 'neutral' | 'cool' | 'hostile';

export type WarmthDefinition = { warmth: Warmth; label: string; meaning: string };

export const warmthScale: WarmthDefinition[] = [
	{ warmth: 'close', label: 'Close', meaning: 'trust each other and would go out of their way' },
	{ warmth: 'warm', label: 'Warm', meaning: 'like each other and work well together' },
	{ warmth: 'neutral', label: 'Neutral', meaning: 'know each other, no strong feeling either way' },
	{ warmth: 'cool', label: 'Cool', meaning: 'wary, distant, or quietly at odds' },
	{ warmth: 'hostile', label: 'Hostile', meaning: 'openly dislike or distrust each other' }
];

export const unknownWarmth: Warmth = 'neutral';

export function isWarmth(candidate: unknown): candidate is Warmth {
	return warmthScale.some((definition) => definition.warmth === candidate);
}

export function findWarmth(warmth: string): WarmthDefinition {
	return (
		warmthScale.find((definition) => definition.warmth === warmth) ?? findWarmth(unknownWarmth)
	);
}
