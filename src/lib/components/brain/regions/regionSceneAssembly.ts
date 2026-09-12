import { Color, FogExp2, Scene } from 'three';
import { createAmbientNeuralWeb, type AmbientNeuralWeb } from '../constellation/ambientNeuralWeb';
import { createCellMaterialBank, type CellMaterialBank } from '../constellation/cellMaterialBank';
import { createGlowTexture } from '../constellation/glowTexture';
import { createStarBackdrop } from '../constellation/starBackdrop';
import { NIGHT_SKY } from '../constellation/constellationPalette';
import { createRegionField, type RegionField } from './regionField';
import type { RegionModel } from './regionTypes';

const DEPTH_FOG_DENSITY = 0.06;
const CLEARANCE_SHARE = 0.95;

export type RegionScene = {
	scene: Scene;
	readonly field: RegionField;
	ambient: AmbientNeuralWeb;
	cells: CellMaterialBank;
	rebuild: (model: RegionModel) => void;
	dispose: () => void;
};

export function assembleRegionScene(model: RegionModel): RegionScene {
	const scene = new Scene();
	scene.background = new Color(NIGHT_SKY);
	scene.fog = new FogExp2(NIGHT_SKY, DEPTH_FOG_DENSITY);

	const glowTexture = createGlowTexture();
	const cells = createCellMaterialBank();
	const backdrop = createStarBackdrop();
	const ambient = createAmbientNeuralWeb(glowTexture);
	scene.add(backdrop.points, ambient.group);

	function mountModel(mountedModel: RegionModel): RegionField {
		const mountedField = createRegionField(mountedModel, glowTexture, cells);
		ambient.keepClearOf(
			mountedModel.regions.map((region) => ({
				centre: region.centre,
				radius: region.radius * CLEARANCE_SHARE
			}))
		);
		scene.add(mountedField.group);
		return mountedField;
	}

	let field = mountModel(model);

	function rebuild(rebuiltModel: RegionModel): void {
		scene.remove(field.group);
		field.dispose();
		field = mountModel(rebuiltModel);
	}

	function dispose(): void {
		scene.remove(field.group);
		field.dispose();
		backdrop.dispose();
		ambient.dispose();
		cells.dispose();
		glowTexture.dispose();
	}

	return {
		scene,
		get field() {
			return field;
		},
		ambient,
		cells,
		rebuild,
		dispose
	};
}
