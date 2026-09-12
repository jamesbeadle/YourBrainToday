const DISMISS_DISTANCE_PIXELS = 120;
const DISMISS_VELOCITY_PIXELS_PER_MILLISECOND = 0.5;

/**
 * A bottom sheet's handle follows the finger downwards; letting go past the
 * dismiss distance, or with a flick, closes the sheet, and otherwise it snaps back.
 */
export class SheetDrag {
	#onDismiss: () => void;
	#startY: number | null = null;
	#startedAt = 0;
	offsetPixels = $state(0);
	isDragging = $state(false);

	constructor(onDismiss: () => void) {
		this.#onDismiss = onDismiss;
	}

	begin = (event: PointerEvent): void => {
		this.#startY = event.clientY;
		this.#startedAt = event.timeStamp;
		this.isDragging = true;
		const handle = event.currentTarget as HTMLElement;
		handle.setPointerCapture(event.pointerId);
	};

	follow = (event: PointerEvent): void => {
		if (this.#startY === null) return;
		this.offsetPixels = Math.max(0, event.clientY - this.#startY);
	};

	release = (event: PointerEvent): void => {
		if (this.#startY === null) return;
		const elapsedMilliseconds = Math.max(1, event.timeStamp - this.#startedAt);
		const velocity = this.offsetPixels / elapsedMilliseconds;
		const shouldDismiss =
			this.offsetPixels >= DISMISS_DISTANCE_PIXELS ||
			velocity >= DISMISS_VELOCITY_PIXELS_PER_MILLISECOND;
		this.#startY = null;
		this.isDragging = false;
		if (shouldDismiss) return this.#onDismiss();
		this.offsetPixels = 0;
	};

	cancel = (): void => {
		this.#startY = null;
		this.isDragging = false;
		this.offsetPixels = 0;
	};
}
