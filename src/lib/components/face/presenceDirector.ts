import { moodStances, type FaceMood, type MoodStance } from './moodStances';
import { mixTowards } from './reliefShapes';
import { wanderAt } from './wanderNoise';

export type { FaceMood } from './moodStances';

export type PresencePose = {
	across: number;
	up: number;
	forward: number;
	gazeAcross: number;
	gazeUp: number;
	tilt: number;
};

const DRIFT_EASE_RATE = 0.9;
const GAZE_EASE_RATE = 3.2;
const TILT_WANDER = 0.045;
const POINTER_MEMORY_SECONDS = 3.5;
const ACROSS_SEED = 1;
const UP_SEED = 2;
const GAZE_ACROSS_SEED = 3;
const GAZE_UP_SEED = 4;
const TILT_SEED = 5;

export class PresenceDirector {
	mood: FaceMood = 'idle';
	private elapsedSeconds = 0;
	private secondsSincePointer = POINTER_MEMORY_SECONDS;
	private pointer = { across: 0, up: 0 };
	private pose: PresencePose = { across: 0, up: 0, forward: 0, gazeAcross: 0, gazeUp: 0, tilt: 0 };

	setMood(mood: FaceMood): void {
		this.mood = mood;
	}

	notePointer(across: number, up: number): void {
		this.pointer = { across, up };
		this.secondsSincePointer = 0;
	}

	advance(deltaSeconds: number): PresencePose {
		this.elapsedSeconds += deltaSeconds;
		this.secondsSincePointer += deltaSeconds;
		const target = this.targetPose(moodStances[this.mood]);
		const drift = Math.min(1, DRIFT_EASE_RATE * deltaSeconds);
		const glance = Math.min(1, GAZE_EASE_RATE * deltaSeconds);
		this.pose.across = mixTowards(this.pose.across, target.across, drift);
		this.pose.up = mixTowards(this.pose.up, target.up, drift);
		this.pose.forward = mixTowards(this.pose.forward, target.forward, drift);
		this.pose.tilt = mixTowards(this.pose.tilt, target.tilt, drift);
		this.pose.gazeAcross = mixTowards(this.pose.gazeAcross, target.gazeAcross, glance);
		this.pose.gazeUp = mixTowards(this.pose.gazeUp, target.gazeUp, glance);
		return { ...this.pose };
	}

	private targetPose(stance: MoodStance): PresencePose {
		const time = this.elapsedSeconds;
		const attention = stance.pointerPull * this.pointerFreshness();
		return {
			across: stance.anchor.across + wanderAt(time, ACROSS_SEED) * stance.roam.across,
			up: stance.anchor.up + wanderAt(time, UP_SEED) * stance.roam.up,
			forward: stance.anchor.forward,
			gazeAcross: mixTowards(
				stance.gazeAnchor.across + wanderAt(time, GAZE_ACROSS_SEED) * stance.gazeRoam,
				this.pointer.across,
				attention
			),
			gazeUp: mixTowards(
				stance.gazeAnchor.up + wanderAt(time, GAZE_UP_SEED) * stance.gazeRoam,
				this.pointer.up,
				attention
			),
			tilt: stance.tilt + wanderAt(time, TILT_SEED) * TILT_WANDER
		};
	}

	private pointerFreshness(): number {
		return Math.max(0, 1 - this.secondsSincePointer / POINTER_MEMORY_SECONDS);
	}
}
