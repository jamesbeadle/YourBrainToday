import { createSceneLoop } from '../../stage/animationLoop';
import { createStage, fitStageTo } from '../../stage/createStage';
import { createOrbitRig, prefersReducedMotion } from '../constellation/orbitRig';
import { createRegionDirector } from './regionDirector';
import { attachRegionInput } from './regionInput';
import { assembleRegionScene } from './regionSceneAssembly';
import type { RegionCallbacks, RegionModel } from './regionTypes';

const FIELD_OF_VIEW_DEGREES = 50;
const FAR_PLANE = 220;

export type RegionExperienceOptions = { onReady?: () => void };

export type RegionExperience = {
	updateModel: (model: RegionModel) => void;
	hoverRegion: (regionId: string | null) => void;
	focusRegion: (regionId: string | null) => void;
	resetView: () => void;
	pause: () => void;
	resume: () => void;
	destroy: () => void;
};

export function createRegionExperience(
	canvas: HTMLCanvasElement,
	container: HTMLElement,
	model: RegionModel,
	callbacks: RegionCallbacks,
	options: RegionExperienceOptions = {}
): RegionExperience {
	const isAnimated = !prefersReducedMotion();
	const stage = createStage(canvas, {
		fieldOfViewDegrees: FIELD_OF_VIEW_DEGREES,
		farPlane: FAR_PLANE
	});
	const view = assembleRegionScene(model);
	const controls = createOrbitRig(stage.camera, canvas);
	const director = createRegionDirector({ camera: stage.camera, controls, view, model, isAnimated });
	const detachPointer = attachRegionInput({
		canvas,
		camera: stage.camera,
		hitTargetsFor: () => view.field.hitTargets,
		callbacks,
		director
	});
	const resizeObserver = fitStageTo(stage, container);
	let knownModel = model;

	function frame(deltaSeconds: number, timeSeconds: number): void {
		director.update(deltaSeconds);
		controls.update();
		view.field.update(timeSeconds, deltaSeconds);
		if (isAnimated) view.cells.tick(timeSeconds);
		view.cells.fitToViewport(canvas.height);
		stage.renderer.render(view.scene, stage.camera);
	}

	const loop = createSceneLoop(frame, options.onReady);

	function updateModel(updatedModel: RegionModel): void {
		if (updatedModel === knownModel) return;
		knownModel = updatedModel;
		view.rebuild(updatedModel);
		director.refresh(updatedModel);
	}

	function destroy(): void {
		loop.pause();
		detachPointer();
		resizeObserver.disconnect();
		controls.dispose();
		view.dispose();
		stage.dispose();
	}

	return {
		updateModel,
		hoverRegion: director.hoverRegion,
		focusRegion: director.focusRegion,
		resetView: () => director.focusRegion(null),
		pause: loop.pause,
		resume: loop.resume,
		destroy
	};
}
