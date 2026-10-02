import { readSourceStages, type ReadingOutcome } from './readSourceStages';

/** Reading a document again runs the same stages as its first reading. */
export async function rereadSource(
	sourceId: string,
	onProgress: (stage: string) => void = () => {}
): Promise<ReadingOutcome> {
	return readSourceStages(sourceId, onProgress);
}
