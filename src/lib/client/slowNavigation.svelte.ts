import { navigating } from '$app/state';

const feelsSlowAfterMilliseconds = 150;

/**
 * True only once a navigation has been in flight long enough to feel slow,
 * so quick hops never flash loading feedback. Create inside a component;
 * every instance tracks the same app-wide navigation state.
 */
export class SlowNavigation {
	isActive = $state(false);

	constructor() {
		$effect(() => {
			if (navigating.to === null) {
				this.isActive = false;
				return;
			}
			const showTimer = setTimeout(() => (this.isActive = true), feelsSlowAfterMilliseconds);
			return () => clearTimeout(showTimer);
		});
	}
}
