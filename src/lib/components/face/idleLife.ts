const BLINK_DURATION_SECONDS = 0.16;
const BLINK_GAP_MINIMUM_SECONDS = 2.4;
const BLINK_GAP_VARIATION_SECONDS = 3.6;
const BREATH_RATE = 1.3;
const BREATH_RISE = 0.02;

export type IdleState = { eyeScale: number; breatheLift: number };

export class IdleLife {
	private elapsedSeconds = 0;
	private nextBlinkAt = 1.8;

	advance(deltaSeconds: number): IdleState {
		this.elapsedSeconds += deltaSeconds;
		return { eyeScale: this.blinkScale(), breatheLift: this.breatheLift() };
	}

	private blinkScale(): number {
		const sinceBlinkStart = this.elapsedSeconds - this.nextBlinkAt;
		if (sinceBlinkStart > BLINK_DURATION_SECONDS) {
			this.nextBlinkAt =
				this.elapsedSeconds +
				BLINK_GAP_MINIMUM_SECONDS +
				Math.random() * BLINK_GAP_VARIATION_SECONDS;
			return 1;
		}
		if (sinceBlinkStart < 0) return 1;
		const blinkProgress = sinceBlinkStart / BLINK_DURATION_SECONDS;
		return Math.abs(blinkProgress * 2 - 1);
	}

	private breatheLift(): number {
		return Math.sin(this.elapsedSeconds * BREATH_RATE) * BREATH_RISE;
	}
}
