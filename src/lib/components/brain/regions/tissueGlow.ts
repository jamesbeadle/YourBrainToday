import { AdditiveBlending, BufferGeometry, Points, PointsMaterial, type Texture } from 'three';
import type { BrainRegion, RegionNeuron } from './regionTypes';

const EPISODE_GLOW_SIZE = 0.3;
const TISSUE_GLOW_SIZE = 0.12;
const HAZE_SIZE = 1.7;
const IDLE_GLOW_OPACITY = 0.55;
const LIT_GLOW_OPACITY = 0.85;
const IDLE_HAZE_OPACITY = 0.075;
const LIT_HAZE_OPACITY = 0.2;
const CROWD_FADE_SHARE = 0.5;
const SHIMMER_SHARE = 0.08;
const SHIMMER_SPEED = 1.6;

export type TissueGlow = {
	layers: Points[];
	light: (excitement: number, crowdDim: number, timeSeconds: number) => void;
	dispose: () => void;
};

export function createTissueGlow(region: BrainRegion, glowTexture: Texture): TissueGlow {
	const glowMaterialFor = (glowSize: number, opacity: number) =>
		new PointsMaterial({
			map: glowTexture,
			color: region.colour,
			size: glowSize,
			transparent: true,
			opacity,
			blending: AdditiveBlending,
			depthWrite: false
		});
	const glowMaterials = [
		glowMaterialFor(EPISODE_GLOW_SIZE, IDLE_GLOW_OPACITY),
		glowMaterialFor(TISSUE_GLOW_SIZE, IDLE_GLOW_OPACITY)
	];
	const hazeMaterial = glowMaterialFor(HAZE_SIZE, IDLE_HAZE_OPACITY);
	const episodes = region.neurons.filter((neuron) => neuron.isEpisode);
	const tissue = region.neurons.filter((neuron) => !neuron.isEpisode);
	const layers = [
		new Points(pointsGeometryOf(episodes), glowMaterials[0]),
		new Points(pointsGeometryOf(tissue), glowMaterials[1]),
		new Points(pointsGeometryOf(region.neurons), hazeMaterial)
	];

	function light(excitement: number, crowdDim: number, timeSeconds: number): void {
		const shimmer = 1 + SHIMMER_SHARE * Math.sin(timeSeconds * SHIMMER_SPEED + region.centre.x);
		const crowdShare = 1 - CROWD_FADE_SHARE * crowdDim;
		const glowOpacity =
			IDLE_GLOW_OPACITY * crowdShare + (LIT_GLOW_OPACITY - IDLE_GLOW_OPACITY) * excitement;
		for (const material of glowMaterials) material.opacity = glowOpacity * shimmer;
		hazeMaterial.opacity =
			IDLE_HAZE_OPACITY * crowdShare + (LIT_HAZE_OPACITY - IDLE_HAZE_OPACITY) * excitement;
	}

	function dispose(): void {
		for (const layer of layers) layer.geometry.dispose();
		for (const material of [...glowMaterials, hazeMaterial]) material.dispose();
	}

	return { layers, light, dispose };
}

function pointsGeometryOf(neurons: RegionNeuron[]): BufferGeometry {
	return new BufferGeometry().setFromPoints(neurons.map((neuron) => neuron.position));
}
