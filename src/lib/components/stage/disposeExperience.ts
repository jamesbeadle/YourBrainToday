import type { SceneLoop } from './animationLoop';
import type { Stage } from './createStage';

type Disposable = { dispose: () => void };

export type ExperienceParts = {
	loop: SceneLoop;
	detachPointer: () => void;
	resizeObserver: ResizeObserver;
	controls: Disposable;
	view: Disposable;
	stage: Stage;
};

/** Stops the loop and lets go of every pointer, observer and GPU resource a scene holds. */
export function disposeExperience(parts: ExperienceParts): void {
	const { loop, detachPointer, resizeObserver, controls, view, stage } = parts;
	loop.pause();
	detachPointer();
	resizeObserver.disconnect();
	controls.dispose();
	view.dispose();
	stage.dispose();
}
