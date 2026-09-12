import type { BrainPage } from '$lib/data/brainTypes';

export type BrainPagePayload = { page: BrainPage; contextName: string | null };

export async function fetchBrainPage(brainId: string, slug: string): Promise<BrainPagePayload> {
	const response = await fetch(`/api/brain/pages/${slug}?brain=${brainId}`);
	if (!response.ok) throw new Error('That page could not be loaded');
	return response.json();
}
