import type { FaceExperience } from './createFaceExperience';

export function attachPointerHandlers(
	canvas: HTMLCanvasElement,
	experience: FaceExperience
): () => void {
	function pointerMoved(event: PointerEvent): void {
		const bounds = canvas.getBoundingClientRect();
		experience.handlePointer(
			((event.clientX - bounds.left) / bounds.width) * 2 - 1,
			-(((event.clientY - bounds.top) / bounds.height) * 2 - 1)
		);
	}
	canvas.addEventListener('pointermove', pointerMoved);
	return () => canvas.removeEventListener('pointermove', pointerMoved);
}
