import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BrainFlight } from './brainFlight.svelte';
import { dashboardMotion } from './dashboardMotion';

vi.mock('../../brain/constellation/orbitRig', () => ({ prefersReducedMotion: () => false }));

type StageLog = { calls: string[]; stage: ConstructorParameters<typeof BrainFlight>[0] };

function loggingStage(): StageLog {
	const calls: string[] = [];
	const stage = {
		focusSlot: (slotId: string, options?: { isInstant?: boolean }) =>
			calls.push(options?.isInstant ? `focus ${slotId} instantly` : `focus ${slotId}`),
		releaseFocus: () => calls.push('release'),
		pause: () => calls.push('pause'),
		resume: () => calls.push('resume'),
		hide: () => calls.push('hide'),
		show: () => calls.push('show')
	};
	return { calls, stage: () => stage };
}

type MountedFlight = { flight: BrainFlight; log: StageLog; unmount: () => void };

async function mountFlight(openBrainId: () => string | null): Promise<MountedFlight> {
	const log = loggingStage();
	let flight!: BrainFlight;
	const unmount = $effect.root(() => {
		flight = new BrainFlight(log.stage, openBrainId);
	});
	await vi.advanceTimersByTimeAsync(0);
	return { flight, log, unmount };
}

describe('BrainFlight', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('keeps the galaxy spinning after the flight until the view has faded in over it', async () => {
		const { flight, log, unmount } = await mountFlight(() => null);
		log.calls.length = 0;
		flight.flyInto('brain-1');
		expect(log.calls).toEqual(['show', 'resume', 'focus brain-1']);
		expect(flight.openingBrainId).toBe('brain-1');
		vi.advanceTimersByTime(dashboardMotion.flightMilliseconds);
		expect(log.calls).toHaveLength(3);
		flight.settleBehindView(dashboardMotion.viewFadeMilliseconds);
		expect(flight.openingBrainId).toBeNull();
		vi.advanceTimersByTime(dashboardMotion.viewFadeMilliseconds - 1);
		expect(log.calls).toHaveLength(3);
		vi.advanceTimersByTime(1);
		expect(log.calls).toEqual(['show', 'resume', 'focus brain-1', 'pause', 'hide']);
		unmount();
	});

	it('tells a view arriving mid-flight how long to wait before fading in', async () => {
		const { flight, unmount } = await mountFlight(() => null);
		flight.flyInto('brain-1');
		vi.advanceTimersByTime(300);
		expect(flight.viewFadeDelayMilliseconds).toBe(dashboardMotion.flightMilliseconds - 300);
		vi.advanceTimersByTime(dashboardMotion.flightMilliseconds);
		expect(flight.viewFadeDelayMilliseconds).toBe(0);
		unmount();
	});

	it('shows the galaxy first when leaving and flies back only once the view has faded out', async () => {
		const { flight, log, unmount } = await mountFlight(() => null);
		flight.flyInto('brain-1');
		flight.settleBehindView(0);
		vi.advanceTimersByTime(dashboardMotion.flightMilliseconds);
		log.calls.length = 0;
		flight.flyOut();
		expect(log.calls).toEqual(['show', 'resume']);
		vi.advanceTimersByTime(dashboardMotion.viewFadeMilliseconds);
		expect(log.calls).toEqual(['show', 'resume', 'release']);
		unmount();
	});

	it('does not restart a flight the route confirms', async () => {
		const { flight, log, unmount } = await mountFlight(() => null);
		log.calls.length = 0;
		flight.flyInto('brain-1');
		flight.flyInto('brain-1');
		expect(log.calls.filter((call) => call.startsWith('focus'))).toHaveLength(1);
		unmount();
	});

	it('cuts straight into a brain the page landed on', async () => {
		const { log, unmount } = await mountFlight(() => 'brain-1');
		expect(log.calls).toEqual(['show', 'resume', 'focus brain-1 instantly']);
		unmount();
	});
});
