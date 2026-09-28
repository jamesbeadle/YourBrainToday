export type SpokenSegment = { speaker: string; text: string };

export function speakerTurnsText(segments: SpokenSegment[]): string {
	const turns = mergeConsecutiveSegments(segments.filter(hasWords));
	const speakerCount = new Set(turns.map((turn) => turn.speaker)).size;
	if (speakerCount <= 1) return turns.map((turn) => turn.text).join('\n\n');
	return turns.map((turn) => `Speaker ${turn.speaker}: ${turn.text}`).join('\n\n');
}

function hasWords(segment: SpokenSegment): boolean {
	return segment.text.trim() !== '';
}

function mergeConsecutiveSegments(segments: SpokenSegment[]): SpokenSegment[] {
	const turns: SpokenSegment[] = [];
	for (const segment of segments) {
		const words = segment.text.trim();
		const currentTurn = turns.at(-1);
		if (currentTurn?.speaker === segment.speaker) {
			currentTurn.text = `${currentTurn.text} ${words}`;
			continue;
		}
		turns.push({ speaker: segment.speaker, text: words });
	}
	return turns;
}
