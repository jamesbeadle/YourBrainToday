import { shapeForViseme, visemesForSentence, type VisemeShape } from './visemeLibrary';

const SECONDS_PER_VISEME = 0.085;

export class SpeakPerformance {
	private visemes: ReturnType<typeof visemesForSentence> = [];
	private elapsedSeconds = 0;

	start(sentence: string): void {
		this.visemes = visemesForSentence(sentence);
		this.elapsedSeconds = 0;
	}

	get isSpeaking(): boolean {
		return this.visemes.length > 0;
	}

	advance(deltaSeconds: number): VisemeShape | null {
		if (!this.isSpeaking) return null;
		this.elapsedSeconds += deltaSeconds;
		const slot = this.elapsedSeconds / SECONDS_PER_VISEME;
		const index = Math.floor(slot);
		if (index >= this.visemes.length) {
			this.visemes = [];
			return null;
		}
		const current = shapeForViseme(this.visemes[index]);
		const next = shapeForViseme(this.visemes[Math.min(index + 1, this.visemes.length - 1)]);
		const blend = slot - index;
		return {
			jawOpen: current.jawOpen + (next.jawOpen - current.jawOpen) * blend,
			mouthWidth: current.mouthWidth + (next.mouthWidth - current.mouthWidth) * blend,
			lipRound: current.lipRound + (next.lipRound - current.lipRound) * blend
		};
	}
}
