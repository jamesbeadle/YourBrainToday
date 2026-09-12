import {
	Color,
	Group,
	Mesh,
	MeshBasicMaterial,
	Scene,
	SphereGeometry,
	Vector3,
	type Sprite
} from 'three';
import { buildMiniBrain } from './miniBrain';
import { buildSpoke, coreGlow, slotPosition } from './kbGalaxyParts';
import { createGlowTexture } from '../../brain/constellation/glowTexture';
import { createStarBackdrop } from '../../brain/constellation/starBackdrop';
import { createTextSprite } from '../../brain/constellation/textSprite';
import { NIGHT_SKY } from '../../brain/constellation/constellationPalette';
import type { ConstellationSlot } from '../constellationSlots';

const HIT_RADIUS = 2.7;
const NAME_OFFSET_Y = -2.5;
const KIND_OFFSET_Y = -3.1;

export type SlotHandle = {
	slot: ConstellationSlot;
	group: Group;
	hitMesh: Mesh;
	labels: Sprite[];
	baseY: number;
	spinSpeed: number;
	bobPhase: number;
	opacityScale: number;
};

export type KbGalaxy = { scene: Scene; handles: SlotHandle[]; dispose: () => void };

export function assembleKbGalaxy(slots: ConstellationSlot[]): KbGalaxy {
	const scene = new Scene();
	scene.background = new Color(NIGHT_SKY);
	const glowTexture = createGlowTexture();
	const backdrop = createStarBackdrop();
	scene.add(backdrop.points);
	const disposers: (() => void)[] = [backdrop.dispose, () => glowTexture.dispose()];
	scene.add(coreGlow(glowTexture));

	const handles = slots.map((slot, slotIndex) => {
		const position = slotPosition(slotIndex, Math.max(slots.length, 3));
		const spoke = buildSpoke(position, slot.accent, slot.variant === 'ghost');
		scene.add(spoke.line);
		disposers.push(spoke.dispose);
		const handle = buildSlotHandle(slot, slotIndex, position, glowTexture, disposers);
		scene.add(handle.group);
		return handle;
	});

	return { scene, handles, dispose: () => disposers.forEach((dispose) => dispose()) };
}

function buildSlotHandle(
	slot: ConstellationSlot,
	slotIndex: number,
	position: Vector3,
	glowTexture: ReturnType<typeof createGlowTexture>,
	disposers: (() => void)[]
): SlotHandle {
	const miniBrain = buildMiniBrain(slot.id, slot.accent, glowTexture, slot.variant === 'ghost');
	disposers.push(miniBrain.dispose);
	const group = miniBrain.group;
	group.position.copy(position);
	group.rotation.y = slotIndex * 1.1;

	const nameSprite = createTextSprite(slot.name, slot.variant === 'ghost' ? '#8a92a8' : '#eef1f8');
	nameSprite.position.y = NAME_OFFSET_Y;
	group.add(nameSprite);
	const kindSprite = createTextSprite(slot.kindLabel.toUpperCase(), slot.accent);
	kindSprite.scale.multiplyScalar(0.72);
	kindSprite.position.y = KIND_OFFSET_Y;
	group.add(kindSprite);

	const hitGeometry = new SphereGeometry(HIT_RADIUS, 8, 8);
	const hitMaterial = new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
	const hitMesh = new Mesh(hitGeometry, hitMaterial);
	group.add(hitMesh);
	disposers.push(() => hitGeometry.dispose(), () => hitMaterial.dispose());

	return {
		slot,
		group,
		hitMesh,
		labels: [nameSprite, kindSprite],
		baseY: position.y,
		spinSpeed: 0.12 + (slotIndex % 3) * 0.05,
		bobPhase: slotIndex * 2.1,
		opacityScale: 1
	};
}
