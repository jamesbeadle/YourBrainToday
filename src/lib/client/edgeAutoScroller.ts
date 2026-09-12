const edgeZoneHeight = 72;
const speedDivisor = 6;

/**
 * Scrolls the window while a drag hovers near the viewport's top or bottom
 * edge, so long lists can be reordered end to end in one drag.
 */
export class EdgeAutoScroller {
	#velocity = 0;
	#frame: number | null = null;

	follow(clientY: number): void {
		this.#velocity = velocityFor(clientY);
		if (this.#velocity === 0 || this.#frame !== null) return;
		this.#frame = requestAnimationFrame(() => this.#step());
	}

	stop(): void {
		if (this.#frame !== null) cancelAnimationFrame(this.#frame);
		this.#frame = null;
		this.#velocity = 0;
	}

	#step(): void {
		if (this.#velocity === 0) {
			this.#frame = null;
			return;
		}
		window.scrollBy(0, this.#velocity);
		this.#frame = requestAnimationFrame(() => this.#step());
	}
}

function velocityFor(clientY: number): number {
	if (clientY < edgeZoneHeight) return (clientY - edgeZoneHeight) / speedDivisor;
	const distanceFromBottom = window.innerHeight - clientY;
	if (distanceFromBottom < edgeZoneHeight) return (edgeZoneHeight - distanceFromBottom) / speedDivisor;
	return 0;
}
