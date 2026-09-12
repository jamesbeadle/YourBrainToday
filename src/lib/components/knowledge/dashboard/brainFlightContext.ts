import { getContext, setContext } from 'svelte';
import type { BrainFlight } from './brainFlight.svelte';

const brainFlightKey = Symbol('brainFlight');

export function provideBrainFlight(flight: BrainFlight): BrainFlight {
	return setContext(brainFlightKey, flight);
}

export function useBrainFlight(): BrainFlight {
	return getContext<BrainFlight>(brainFlightKey);
}
