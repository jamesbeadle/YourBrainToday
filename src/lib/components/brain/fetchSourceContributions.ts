import { parseReadingProgress, type ReadingProgress } from '$lib/data/sourceReading';

export type SourceContributions = {
	pageSlugs: string[];
	progress: ReadingProgress;
};

/** What a source added to the brain, or null when it could not be fetched. */
export async function fetchSourceContributions(
	sourceId: string
): Promise<SourceContributions | null> {
	try {
		const response = await fetch(`/api/brain/sources/${sourceId}/contributions`);
		if (!response.ok) return null;
		const payload = await response.json();
		return {
			pageSlugs: Array.isArray(payload.pageSlugs) ? payload.pageSlugs : [],
			progress: parseReadingProgress(payload.progress)
		};
	} catch {
		return null;
	}
}
