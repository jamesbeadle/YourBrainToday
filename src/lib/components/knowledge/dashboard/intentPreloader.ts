import { dashboardMotion } from './dashboardMotion';
import { preloadData } from '$app/navigation';

export type IntentPreloader = {
	intend: (href: string | null) => void;
	cancel: () => void;
};

/**
 * Loads a brain's page data once the pointer has rested on it for a moment,
 * so a sweep across the ring fires one load rather than one per brain.
 */
export function createIntentPreloader(): IntentPreloader {
	let timer: ReturnType<typeof setTimeout> | undefined;

	function cancel(): void {
		clearTimeout(timer);
	}

	function intend(href: string | null): void {
		cancel();
		if (href === null) return;
		timer = setTimeout(() => preloadQuietly(href), dashboardMotion.prefetchIntentMilliseconds);
	}

	return { intend, cancel };
}

function preloadQuietly(href: string): void {
	preloadData(href).catch(() => {});
}
