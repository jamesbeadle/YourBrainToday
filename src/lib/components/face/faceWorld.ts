import { Group, Scene } from 'three';
import { expressionLibrary, type ExpressionName } from './expressionLibrary';
import {
	blendTowards, copyParameters, neutralParameters, type FaceRigParameters
} from './faceRigParameters';
import { IdleLife } from './idleLife';
import { PresenceDirector, type FaceMood, type PresencePose } from './presenceDirector';
import { createReliefBackdrop } from './reliefBackdrop';
import { createReliefLighting } from './reliefLighting';
import { SpeakPerformance } from './speakPerformance';
import { createSpeckleField, type SpeckleField } from './speckleField';
import { buildVoxelFace } from './voxelFace';
import { VoxelRig } from './voxelRig';

const PARAMETER_BLEND_RATE = 9;
const HEAD_TURN_REACH = 0.26;
const HEAD_NOD_REACH = 0.15;
const HEAD_TURN_RATE = 4;
const FACE_LIFT = 0.06;

export class FaceWorld {
	scene = new Scene();
	private faceGroup = new Group();
	private rig: VoxelRig;
	private speckles: SpeckleField;
	private currentParameters: FaceRigParameters = copyParameters(neutralParameters);
	private expressionTarget: FaceRigParameters = copyParameters(neutralParameters);
	private speech = new SpeakPerformance();
	private idle = new IdleLife();
	private presence = new PresenceDirector();

	constructor() {
		this.scene.background = createReliefBackdrop();
		const face = buildVoxelFace();
		this.rig = new VoxelRig(face.mesh, face.placements);
		this.speckles = createSpeckleField();
		this.faceGroup.add(face.mesh);
		this.scene.add(this.faceGroup, this.speckles.mesh, createReliefLighting());
	}

	setExpression(name: ExpressionName): void {
		this.expressionTarget = copyParameters(expressionLibrary[name]);
	}

	setMood(mood: FaceMood): void {
		this.presence.setMood(mood);
	}

	speak(sentence: string): void {
		this.speech.start(sentence);
		this.presence.setMood('speaking');
		if (!('speechSynthesis' in window)) return;
		window.speechSynthesis.cancel();
		window.speechSynthesis.speak(new SpeechSynthesisUtterance(sentence));
	}

	setPointer(across: number, up: number): void {
		this.presence.notePointer(across, up);
	}

	get isSpeaking(): boolean {
		return this.speech.isSpeaking;
	}

	update(deltaSeconds: number, timeSeconds: number): void {
		this.settleWhenSpeechEnds();
		const idleState = this.idle.advance(deltaSeconds);
		const pose = this.presence.advance(deltaSeconds);
		const target = copyParameters(this.expressionTarget);
		const viseme = this.speech.advance(deltaSeconds);
		if (viseme) Object.assign(target, viseme);
		blendTowards(this.currentParameters, target, PARAMETER_BLEND_RATE, deltaSeconds);
		this.rig.applyParameters(this.currentParameters, {
			openness: this.currentParameters.eyeOpenness * idleState.eyeScale,
			gazeAcross: pose.gazeAcross,
			gazeUp: pose.gazeUp
		});
		this.carryHead(deltaSeconds, pose, idleState.breatheLift);
		this.speckles.drift(timeSeconds);
	}

	private settleWhenSpeechEnds(): void {
		if (this.presence.mood !== 'speaking' || this.speech.isSpeaking) return;
		this.presence.setMood('idle');
		this.expressionTarget = copyParameters(neutralParameters);
	}

	private carryHead(deltaSeconds: number, pose: PresencePose, breatheLift: number): void {
		const turnAmount = Math.min(1, HEAD_TURN_RATE * deltaSeconds);
		const group = this.faceGroup;
		group.rotation.y += (pose.gazeAcross * HEAD_TURN_REACH - group.rotation.y) * turnAmount;
		group.rotation.x += (-pose.gazeUp * HEAD_NOD_REACH - group.rotation.x) * turnAmount;
		group.rotation.z += (pose.tilt - group.rotation.z) * turnAmount;
		group.position.set(pose.across, pose.up + FACE_LIFT + breatheLift, pose.forward);
	}
}
