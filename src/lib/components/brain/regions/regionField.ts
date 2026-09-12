import { Group, IcosahedronGeometry, Mesh, MeshBasicMaterial, type Texture } from 'three';
import { createRegionBody, type RegionBody } from './regionBody';
import type { CellMaterialBank } from '../constellation/cellMaterialBank';
import type { RegionModel } from './regionTypes';

const SOMA_DETAIL = 3;
const HIT_DETAIL = 2;
const LIGHTING_RATE_PER_SECOND = 7;

type Lighting = { body: RegionBody; excitement: number; crowdDim: number };

export type RegionField = {
	group: Group;
	hitTargets: Mesh[];
	setHover: (regionId: string | null) => void;
	update: (timeSeconds: number, deltaSeconds: number) => void;
	dispose: () => void;
};

export function createRegionField(
	model: RegionModel,
	glowTexture: Texture,
	cells: CellMaterialBank
): RegionField {
	const somaGeometry = new IcosahedronGeometry(1, SOMA_DETAIL);
	const hitGeometry = new IcosahedronGeometry(1, HIT_DETAIL);
	const hitMaterial = new MeshBasicMaterial({ visible: false });
	const supplies = { somaGeometry, hitGeometry, hitMaterial, glowTexture, cells };
	const group = new Group();
	const lightings: Lighting[] = model.regions.map((region) => {
		const body = createRegionBody(region, supplies);
		group.add(body.group);
		return { body, excitement: 0, crowdDim: 0 };
	});
	let hoveredId: string | null = null;

	function setHover(regionId: string | null): void {
		hoveredId = regionId;
	}

	function update(timeSeconds: number, deltaSeconds: number): void {
		const approach = 1 - Math.exp(-LIGHTING_RATE_PER_SECOND * deltaSeconds);
		for (const lighting of lightings) {
			const isHovered = lighting.body.region.id === hoveredId;
			const wantedExcitement = isHovered ? 1 : 0;
			const wantedCrowdDim = hoveredId !== null && !isHovered ? 1 : 0;
			lighting.excitement += (wantedExcitement - lighting.excitement) * approach;
			lighting.crowdDim += (wantedCrowdDim - lighting.crowdDim) * approach;
			lighting.body.light(lighting.excitement, lighting.crowdDim, timeSeconds);
		}
	}

	function dispose(): void {
		for (const lighting of lightings) lighting.body.dispose();
		somaGeometry.dispose();
		hitGeometry.dispose();
		hitMaterial.dispose();
	}

	return {
		group,
		hitTargets: lightings.map((lighting) => lighting.body.hitTarget),
		setHover,
		update,
		dispose
	};
}
