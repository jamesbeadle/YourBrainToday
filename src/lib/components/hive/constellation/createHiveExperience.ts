import { startAnimationLoop } from '../../stage/animationLoop';
import { createStage, fitStageTo, type Stage } from '../../stage/createStage';
import { assembleHiveScene, type HiveScene } from './hiveSceneAssembly';
import { buildHiveSwarms } from './hiveSwarmModel';
import { createOrbitRig, prefersReducedMotion } from '../../brain/constellation/orbitRig';
import type { HiveMember } from '$lib/data/hiveTypes';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const FIELD_OF_VIEW_DEGREES = 50;
const FAR_PLANE = 220;
const OPENING_CAMERA_HEIGHT = 4;
const OPENING_CAMERA_DISTANCE = 13.5;

export class HiveExperience {
	private stage: Stage;
	private view: HiveScene;
	private controls: OrbitControls;
	private stopLoop: () => void;
	private resizeObserver: ResizeObserver;
	private isAnimated = !prefersReducedMotion();

	constructor(canvas: HTMLCanvasElement, container: HTMLElement, members: HiveMember[]) {
		this.stage = createStage(canvas, {
			fieldOfViewDegrees: FIELD_OF_VIEW_DEGREES,
			farPlane: FAR_PLANE
		});
		this.stage.camera.position.set(0, OPENING_CAMERA_HEIGHT, OPENING_CAMERA_DISTANCE);
		this.view = assembleHiveScene(buildHiveSwarms(members));
		this.controls = createOrbitRig(this.stage.camera, canvas);
		this.resizeObserver = fitStageTo(this.stage, container);
		this.stopLoop = startAnimationLoop((delta, time) => this.frame(delta, time));
	}

	private frame(deltaSeconds: number, timeSeconds: number): void {
		if (this.isAnimated) this.view.update(deltaSeconds, timeSeconds);
		this.controls.update();
		this.stage.renderer.render(this.view.scene, this.stage.camera);
	}

	destroy(): void {
		this.stopLoop();
		this.resizeObserver.disconnect();
		this.controls.dispose();
		this.view.dispose();
		this.stage.dispose();
	}
}
