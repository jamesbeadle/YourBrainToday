import { Group, Mesh, Vector3, type BufferGeometry, type MeshBasicMaterial } from 'three';
import { createCellSoma, somaRadiusOf, type SomaProportions } from '../constellation/cellSoma';
import { createTextSprite } from '../constellation/textSprite';
import { asCssColour, CHALK } from '../constellation/constellationPalette';
import type { MaterialBank } from '../constellation/materialBank';
import type { CellMaterialBank } from '../constellation/cellMaterialBank';
import type { FlowNode } from './flowTypes';

const stationProportions: SomaProportions = { somaRadius: 0.03, glowScale: 0.26 };
const rootProportions: SomaProportions = { somaRadius: 0.024, glowScale: 0.2 };
const HIT_RADIUS = 0.3;
const LABEL_LIFT = 0.16;
const LABEL_SCREEN_HEIGHT = 0.022;
const IDLE_LABEL_OPACITY = 0.3;
const LONGEST_LABEL = 26;
const INFERRED_BRIGHTNESS = 0.5;
const TWINKLE_SHARE = 0.1;
const TWINKLE_SPEED = 1.6;
const HOVER_GLOW_LIFT = 0.5;

export type FlowStation = {
	group: Group;
	hitTarget: Mesh;
	node: FlowNode;
	excite: () => void;
	light: (isHovered: boolean, timeSeconds: number, deltaSeconds: number) => void;
	dispose: () => void;
};

export type StationSupplies = {
	somaGeometry: BufferGeometry;
	hitGeometry: BufferGeometry;
	hitMaterial: MeshBasicMaterial;
	bank: MaterialBank;
	cells: CellMaterialBank;
};

function shortened(name: string): string {
	if (name.length <= LONGEST_LABEL) return name;
	return `${name.slice(0, LONGEST_LABEL - 1).trimEnd()}…`;
}

export function proportionsFor(node: FlowNode): SomaProportions {
	return node.kind === 'station' ? stationProportions : rootProportions;
}

export function somaRadiusForNode(node: FlowNode): number {
	return somaRadiusOf(node.id, proportionsFor(node));
}

export function contextKeyFor(node: FlowNode): string {
	return node.isInferred ? `lane:${node.roleIndex}:inferred` : `lane:${node.roleIndex}`;
}

export function createFlowStation(node: FlowNode, supplies: StationSupplies): FlowStation {
	const contextKey = contextKeyFor(node);
	const soma = createCellSoma({
		slug: node.id,
		position: node.position,
		colour: node.colour,
		contextKey,
		proportions: proportionsFor(node),
		somaGeometry: supplies.somaGeometry,
		bank: supplies.bank,
		cells: supplies.cells
	});
	if (node.isInferred) supplies.cells.setBrightness(contextKey, INFERRED_BRIGHTNESS);

	const label = createTextSprite(shortened(node.name).toUpperCase(), asCssColour(CHALK), LABEL_SCREEN_HEIGHT);
	label.position.copy(node.position).add(new Vector3(0, LABEL_LIFT, 0));
	label.material.opacity = IDLE_LABEL_OPACITY;

	const hitTarget = new Mesh(supplies.hitGeometry, supplies.hitMaterial);
	hitTarget.position.copy(node.position);
	hitTarget.scale.setScalar(HIT_RADIUS);
	hitTarget.userData = { nodeId: node.id };

	const group = new Group();
	group.add(soma.core, soma.glow, label, hitTarget);

	function light(isHovered: boolean, timeSeconds: number, deltaSeconds: number): void {
		const shimmer = TWINKLE_SHARE * Math.sin(timeSeconds * TWINKLE_SPEED + node.position.x);
		soma.glowPulse(1 + shimmer + (isHovered ? HOVER_GLOW_LIFT : 0), deltaSeconds);
		label.material.opacity = isHovered ? 1 : IDLE_LABEL_OPACITY;
	}

	function dispose(): void {
		label.material.map?.dispose();
		label.material.dispose();
	}

	return { group, hitTarget, node, excite: soma.excite, light, dispose };
}
