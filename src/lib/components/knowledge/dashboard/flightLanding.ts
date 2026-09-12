import { dashboardMotion } from './dashboardMotion';

/** When the camera lands: a flight lands after its duration, a cut at once, and a view waits for it. */
export class FlightLanding {
	#landingTime: number | null = null;
	#timer: ReturnType<typeof setTimeout> | undefined;

	get millisecondsUntilLanded(): number {
		if (this.#landingTime === null) return 0;
		return Math.max(0, this.#landingTime - Date.now());
	}

	begin(isInstant: boolean): void {
		this.land();
		if (isInstant) return;
		this.#landingTime = Date.now() + dashboardMotion.flightMilliseconds;
		this.#timer = setTimeout(() => this.land(), dashboardMotion.flightMilliseconds);
	}

	land(): void {
		clearTimeout(this.#timer);
		this.#landingTime = null;
	}
}
