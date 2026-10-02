/**
 * Where a filed item came from. Items filed from a document carry the
 * source's id as well as its name, so forgetting or re-reading one source
 * never touches another that happens to share a filename; items stated in
 * an interview carry the word alone.
 */
export type SourceProvenance = { label: string; sourceId?: string };

export const statedProvenance: SourceProvenance = { label: 'stated' };

export function provenanceData(provenance: SourceProvenance): Record<string, unknown> {
	if (provenance.sourceId === undefined) return { provenance: provenance.label };
	return { provenance: provenance.label, sourceId: provenance.sourceId };
}
