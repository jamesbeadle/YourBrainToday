import { CanvasTexture, Color, SRGBColorSpace } from 'three';
import { ReliefPalette } from './reliefPalette';

const BACKDROP_SIZE = 512;
const HALO_CENTRE_HEIGHT = 0.44;
const HALO_INNER_RADIUS = 0.05;
const HALO_OUTER_RADIUS = 0.78;
const HALO_LIFT = 0.055;

function cssColour(hex: number, lift: number): string {
	const colour = new Color(hex);
	colour.offsetHSL(0, 0, lift);
	return `#${colour.getHexString()}`;
}

export function createReliefBackdrop(): CanvasTexture {
	const canvas = document.createElement('canvas');
	canvas.width = BACKDROP_SIZE;
	canvas.height = BACKDROP_SIZE;
	const context = canvas.getContext('2d');
	if (context) {
		const centreAcross = BACKDROP_SIZE / 2;
		const centreUp = BACKDROP_SIZE * HALO_CENTRE_HEIGHT;
		const halo = context.createRadialGradient(
			centreAcross, centreUp, BACKDROP_SIZE * HALO_INNER_RADIUS,
			centreAcross, centreUp, BACKDROP_SIZE * HALO_OUTER_RADIUS
		);
		halo.addColorStop(0, cssColour(ReliefPalette.backdropTop, HALO_LIFT));
		halo.addColorStop(0.55, cssColour(ReliefPalette.backdropTop, 0));
		halo.addColorStop(1, cssColour(ReliefPalette.backdropBottom, 0));
		context.fillStyle = halo;
		context.fillRect(0, 0, BACKDROP_SIZE, BACKDROP_SIZE);
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	return texture;
}
