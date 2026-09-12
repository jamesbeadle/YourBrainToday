import {
	AdditiveBlending,
	BufferGeometry,
	Float32BufferAttribute,
	Group,
	LineBasicMaterial,
	LineSegments,
	Points,
	PointsMaterial,
	Sprite,
	SpriteMaterial,
	Color,
	type Texture
} from 'three';
import { flattenSamples, linkPositions, sampleBrainPoints } from './miniBrainGeometry';

const NEURON_SIZE = 0.5;
const HALO_SCALE = 6.5;

export type MiniBrain = { group: Group; dispose: () => void };

export function buildMiniBrain(
	seedText: string,
	accentCss: string,
	glowTexture: Texture,
	isGhost: boolean
): MiniBrain {
	const accent = new Color(accentCss);
	const samples = sampleBrainPoints(seedText);
	const group = new Group();
	const disposers: (() => void)[] = [];

	const pointGeometry = new BufferGeometry();
	pointGeometry.setAttribute('position', new Float32BufferAttribute(flattenSamples(samples), 3));
	const pointMaterial = new PointsMaterial({
		map: glowTexture,
		color: accent,
		size: NEURON_SIZE,
		transparent: true,
		opacity: isGhost ? 0.3 : 0.85,
		blending: AdditiveBlending,
		depthWrite: false
	});
	group.add(new Points(pointGeometry, pointMaterial));
	disposers.push(() => pointGeometry.dispose(), () => pointMaterial.dispose());

	const linkGeometry = new BufferGeometry();
	linkGeometry.setAttribute('position', new Float32BufferAttribute(linkPositions(samples), 3));
	const linkMaterial = new LineBasicMaterial({
		color: accent,
		transparent: true,
		opacity: isGhost ? 0.08 : 0.22,
		blending: AdditiveBlending,
		depthWrite: false
	});
	group.add(new LineSegments(linkGeometry, linkMaterial));
	disposers.push(() => linkGeometry.dispose(), () => linkMaterial.dispose());

	const haloMaterial = new SpriteMaterial({
		map: glowTexture,
		color: accent,
		transparent: true,
		opacity: isGhost ? 0.05 : 0.13,
		blending: AdditiveBlending,
		depthWrite: false
	});
	const halo = new Sprite(haloMaterial);
	halo.scale.setScalar(HALO_SCALE);
	group.add(halo);
	disposers.push(() => haloMaterial.dispose());

	return { group, dispose: () => disposers.forEach((dispose) => dispose()) };
}
