import { AdditiveBlending, Mesh, Sprite, SpriteMaterial, type Vector3 } from 'three';
import { SYNAPSE_TINT } from './flowPalette';
import type { PathwaySupplies } from './flowPathway';
import type { FlowEdge } from './flowTypes';

const SYNAPSE_HIT_RADIUS = 0.16;
const SYNAPSE_SCALE = 0.14;
const IDLE_SYNAPSE_OPACITY = 0.55;

export type SynapseBouton = {
	bouton: Sprite;
	hitTarget: Mesh;
	light: (isHovered: boolean) => void;
	dispose: () => void;
};

export function createSynapseBouton(
	edge: FlowEdge,
	pulsePoints: Vector3[],
	supplies: PathwaySupplies
): SynapseBouton {
	const midpoint = pulsePoints[Math.floor(pulsePoints.length / 2)];
	const material = new SpriteMaterial({
		map: supplies.glowTexture,
		color: SYNAPSE_TINT,
		transparent: true,
		opacity: IDLE_SYNAPSE_OPACITY,
		blending: AdditiveBlending,
		depthWrite: false
	});
	const bouton = new Sprite(material);
	bouton.position.copy(midpoint);
	bouton.scale.setScalar(SYNAPSE_SCALE);
	const hitTarget = new Mesh(supplies.hitGeometry, supplies.hitMaterial);
	hitTarget.position.copy(midpoint);
	hitTarget.scale.setScalar(SYNAPSE_HIT_RADIUS);
	hitTarget.userData = { edgeId: edge.id };

	function light(isHovered: boolean): void {
		material.opacity = isHovered ? 1 : IDLE_SYNAPSE_OPACITY;
	}

	return { bouton, hitTarget, light, dispose: () => material.dispose() };
}
