import { createSceneLoop } from '../../stage/animationLoop';
import { createStage, fitStageTo } from '../../stage/createStage';
import { createOrbitRig, prefersReducedMotion } from '../constellation/orbitRig';
import { createFlowDirector } from './flowDirector';
import { attachFlowInput } from './flowInput';
import { assembleFlowScene } from './flowSceneAssembly';
import type { FlowCallbacks, FlowModel } from './flowTypes';

const FIELD_OF_VIEW_DEGREES = 50;
const FAR_PLANE = 220;

export type FlowExperienceOptions = { onReady?: () => void };

export type FlowExperience = {
	updateModel: (model: FlowModel) => void;
	focusNode: (nodeId: string | null) => void;
	hoverNode: (nodeId: string | null) => void;
	resetView: () => void;
	pause: () => void;
	resume: () => void;
	destroy: () => void;
};

export function createFlowExperience(
	canvas: HTMLCanvasElement,
	container: HTMLElement,
	model: FlowModel,
	callbacks: FlowCallbacks,
	options: FlowExperienceOptions = {}
): FlowExperience {
	const isAnimated = !prefersReducedMotion();
	const stage = createStage(canvas, { fieldOfViewDegrees: FIELD_OF_VIEW_DEGREES, farPlane: FAR_PLANE });
	const view = assembleFlowScene(model);
	const controls = createOrbitRig(stage.camera, canvas);
	const director = createFlowDirector({ camera: stage.camera, controls, view, model, isAnimated });
	const detachPointer = attachFlowInput({
		canvas,
		camera: stage.camera,
		hitTargetsFor: () => view.mounted.field.hitTargets,
		callbacks,
		director
	});
	const resizeObserver = fitStageTo(stage, container);
	let knownModel = model;

	function frame(deltaSeconds: number, timeSeconds: number): void {
		director.update(deltaSeconds);
		controls.update();
		view.mounted.field.update(timeSeconds, deltaSeconds);
		if (isAnimated) view.mounted.traffic.update(deltaSeconds);
		if (isAnimated) view.cells.tick(timeSeconds);
		view.cells.fitToViewport(canvas.height);
		stage.renderer.render(view.scene, stage.camera);
	}

	const loop = createSceneLoop(frame, options.onReady);

	function updateModel(updatedModel: FlowModel): void {
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
		focusNode: director.focusNode,
		hoverNode: (nodeId) => director.hover(nodeId === null ? null : { nodeId }),
		resetView: () => director.focusNode(null),
		pause: loop.pause,
		resume: loop.resume,
		destroy
	};
}
