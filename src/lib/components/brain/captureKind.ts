export type CaptureKind = 'nothing' | 'link' | 'note';

const wholeLinkPattern = /^https?:\/\/\S+\.\S+$/i;

/** What a pasted capture is: nothing yet, one link on its own, or anything else as a note. */
export function recogniseCapture(capture: string): CaptureKind {
	const trimmed = capture.trim();
	if (trimmed === '') return 'nothing';
	if (wholeLinkPattern.test(trimmed)) return 'link';
	return 'note';
}
