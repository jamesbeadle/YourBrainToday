import { startAnimationLoop } from '../stage/animationLoop';
import { createStage, fitStageTo, type Stage } from '../stage/createStage';
import type { ExpressionName } from './expressionLibrary';
import { FaceWorld } from './faceWorld';
import type { FaceMood } from './presenceDirector';

const CAMERA_DISTANCE = 4.4;
const CAMERA_HEIGHT = 0.06;

export class FaceExperience {
	private stage: Stage;
	private faceWorld = new FaceWorld();
	private stopLoop: () => void;
	private resizeObserver: ResizeObserver;

	constructor(canvas: HTMLCanvasElement, container: HTMLElement) {
		this.stage = createStage(canvas);
		this.stage.camera.position.set(0, CAMERA_HEIGHT, CAMERA_DISTANCE);
		this.stage.camera.lookAt(0, CAMERA_HEIGHT, 0);
		this.resizeObserver = fitStageTo(this.stage, container);
		this.stopLoop = startAnimationLoop((delta, time) => this.frame(delta, time));
	}

	private frame(deltaSeconds: number, timeSeconds: number): void {
		this.faceWorld.update(deltaSeconds, timeSeconds);
		this.stage.renderer.render(this.faceWorld.scene, this.stage.camera);
	}

	setExpression(name: ExpressionName): void {
		this.faceWorld.setExpression(name);
	}

	setMood(mood: FaceMood): void {
		this.faceWorld.setMood(mood);
	}

	speak(sentence: string): void {
		this.faceWorld.speak(sentence);
	}

	get isSpeaking(): boolean {
		return this.faceWorld.isSpeaking;
	}

	handlePointer(across: number, up: number): void {
		this.faceWorld.setPointer(across, up);
	}

	destroy(): void {
		this.stopLoop();
		this.resizeObserver.disconnect();
		this.stage.dispose();
	}
}
