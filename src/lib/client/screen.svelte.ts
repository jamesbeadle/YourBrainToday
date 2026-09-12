const WIDE_SCREEN_QUERY = '(min-width: 1024px)';

/**
 * The viewport as a live media query: isWideScreen follows the lg breakpoint
 * as the window resizes, and reads false on the server.
 */
class Screen {
	#isWideScreen = $state(false);

	constructor() {
		if (typeof window === 'undefined') return;
		const wideScreenQuery = window.matchMedia(WIDE_SCREEN_QUERY);
		this.#isWideScreen = wideScreenQuery.matches;
		wideScreenQuery.addEventListener('change', (change) => (this.#isWideScreen = change.matches));
	}

	get isWideScreen(): boolean {
		return this.#isWideScreen;
	}
}

export const screen = new Screen();
