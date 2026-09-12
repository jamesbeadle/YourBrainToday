import { Group, Mesh, type BufferGeometry, type MeshBasicMaterial, type Texture } from 'three';
import { mergedFibreGeometry } from '../constellation/fibreGeometry';
import { createRegionHalo } from './regionHalo';
import { localLinksOf } from './regionLinks';
import { createTissueCloud } from './tissueCloud';
import type { CellMaterialBank } from '../constellation/cellMaterialBank';
import type { BrainRegion } from './regionTypes';

const LINK_RADIAL_SEGMENTS = 5;
const BRIGHTEN = 0.25;
const CROWD_DIM = 0.45;

export type RegionBody = {
	group: Group;
	hitTarget: Mesh;
	region: BrainRegion;
	light: (excitement: number, crowdDim: number, timeSeconds: number) => void;
	dispose: () => void;
};

export type RegionBodySupplies = {
	somaGeometry: BufferGeometry;
	hitGeometry: BufferGeometry;
	hitMaterial: MeshBasicMaterial;
	glowTexture: Texture;
	cells: CellMaterialBank;
};

export function createRegionBody(region: BrainRegion, supplies: RegionBodySupplies): RegionBody {
	const { cells, glowTexture } = supplies;
	const tissue = createTissueCloud(region, supplies.somaGeometry, glowTexture, cells);
	const tints = { root: region.colour, span: region.colour, tip: region.colour };
	const links = new Mesh(
		mergedFibreGeometry(localLinksOf(region, tissue.somaRadiusFor), LINK_RADIAL_SEGMENTS),
		cells.axonFor(`region:${region.id}`, tints, region.id)
	);
	const halo = createRegionHalo(region, glowTexture);

	const hitTarget = new Mesh(supplies.hitGeometry, supplies.hitMaterial);
	hitTarget.position.copy(region.centre);
	hitTarget.scale.setScalar(region.radius);
	hitTarget.userData = { regionId: region.id };

	const group = new Group();
	group.add(tissue.somas, ...tissue.glows, links, halo.halo, halo.label, hitTarget);

	function light(excitement: number, crowdDim: number, timeSeconds: number): void {
		cells.setBrightness(region.id, 1 + BRIGHTEN * excitement - CROWD_DIM * crowdDim);
		halo.light(excitement, crowdDim);
		tissue.light(excitement, crowdDim, timeSeconds);
	}

	function dispose(): void {
		links.geometry.dispose();
		halo.dispose();
		tissue.dispose();
	}

	return { group, hitTarget, region, light, dispose };
}
