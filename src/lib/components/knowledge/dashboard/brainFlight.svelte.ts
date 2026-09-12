import { viewFadeMilliseconds } from './dashboardMotion';
import { FlightLanding } from './flightLanding';
import { pageVisibility } from '$lib/client/pageVisibility.svelte';
import type KbConstellation from '../KbConstellation.svelte';

type Stage = Pick<KbConstellation, 'focusSlot' | 'releaseFocus' | 'pause' | 'resume' | 'hide' | 'show'>;

type Timer = ReturnType<typeof setTimeout> | undefined;

/**
 * Keeps the galaxy in step with the URL and the brain's view. Opening a brain
 * flies the camera in and keeps the galaxy spinning until the view has drawn
 * and faded in over it, then rests the galaxy unseen. Leaving shows the galaxy
 * again first, lets the view fade out over it, then flies back to the ring.
 * Landing directly on a brain cuts instead of flying, and a hidden page rests
 * the galaxy until it is seen again. Create inside a component.
 */
export class BrainFlight {
	#stage: () => Stage | undefined;
	#openBrainId: () => string | null;
	#hasFollowedRoute = false;
	#destinationBrainId: string | null = null;
	#landing = new FlightLanding();
	#restTimer: Timer;
	#releaseTimer: Timer;
	openingBrainId = $state<string | null>(null);

	constructor(stage: () => Stage | undefined, openBrainId: () => string | null) {
		this.#stage = stage;
		this.#openBrainId = openBrainId;
		$effect(() => this.followRoute());
		$effect(() => this.restWhileHidden());
	}

	/** A view entered by flight waits for the camera to land; a deep link, or a landed camera, shows it at once. */
	get viewFadeDelayMilliseconds(): number {
		return this.#landing.millisecondsUntilLanded;
	}

	flyInto(brainId: string, isInstant = false): void {
		if (this.#destinationBrainId === brainId) return;
		this.#destinationBrainId = brainId;
		this.openingBrainId = brainId;
		this.settleTimers();
		this.#landing.begin(isInstant);
		this.wake();
		this.#stage()?.focusSlot(brainId, { isInstant });
	}

	flyOut(): void {
		if (this.#destinationBrainId === null) return;
		this.#destinationBrainId = null;
		this.openingBrainId = null;
		this.settleTimers();
		this.#landing.land();
		this.wake();
		this.#releaseTimer = setTimeout(() => this.#stage()?.releaseFocus(), viewFadeMilliseconds());
	}

	/** The view has begun fading in over the galaxy, which rests unseen once the fade is done. */
	settleBehindView(fadeEndsInMilliseconds: number): void {
		this.openingBrainId = null;
		clearTimeout(this.#restTimer);
		this.#restTimer = setTimeout(() => this.rest(), fadeEndsInMilliseconds);
	}

	private settleTimers(): void {
		clearTimeout(this.#restTimer);
		clearTimeout(this.#releaseTimer);
	}

	private wake(): void {
		this.#stage()?.show();
		this.#stage()?.resume();
	}

	private rest(): void {
		this.#stage()?.pause();
		this.#stage()?.hide();
	}

	private followRoute(): void {
		if (this.#stage() === undefined) return;
		const brainId = this.#openBrainId();
		const isDeepLink = !this.#hasFollowedRoute;
		this.#hasFollowedRoute = true;
		if (brainId === null) return this.flyOut();
		this.flyInto(brainId, isDeepLink);
	}

	private restWhileHidden(): void {
		if (pageVisibility.isHidden) return this.#stage()?.pause();
		if (this.#openBrainId() === null) this.#stage()?.resume();
	}
}
