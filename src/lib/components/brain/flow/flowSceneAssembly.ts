import { Color, FogExp2, Scene } from 'three';
import { createAmbientNeuralWeb, type AmbientNeuralWeb } from '../constellation/ambientNeuralWeb';
import { createCellMaterialBank, type CellMaterialBank } from '../constellation/cellMaterialBank';
import { createGlowTexture } from '../constellation/glowTexture';
import { createMaterialBank } from '../constellation/materialBank';
import { createStarBackdrop } from '../constellation/starBackdrop';
import { NIGHT_SKY } from '../constellation/constellationPalette';
import { createFlowField, type FlowField } from './flowField';
import { createTokenTraffic, type TokenTraffic } from './tokenTraffic';
import type { FlowModel } from './flowTypes';

const DEPTH_FOG_DENSITY = 0.045;
const STATION_CLEARANCE = 0.4;

export type MountedFlow = { field: FlowField; traffic: TokenTraffic };

export type FlowScene = {
	scene: Scene;
	readonly mounted: MountedFlow;
	ambient: AmbientNeuralWeb;
	cells: CellMaterialBank;
	rebuild: (model: FlowModel) => void;
	dispose: () => void;
};

export function assembleFlowScene(model: FlowModel): FlowScene {
	const scene = new Scene();
	scene.background = new Color(NIGHT_SKY);
	scene.fog = new FogExp2(NIGHT_SKY, DEPTH_FOG_DENSITY);

	const glowTexture = createGlowTexture();
	const bank = createMaterialBank(glowTexture);
	const cells = createCellMaterialBank();
	const backdrop = createStarBackdrop();
	const ambient = createAmbientNeuralWeb(glowTexture);
	scene.add(backdrop.points, ambient.group);

	function mountModel(mountedModel: FlowModel): MountedFlow {
		const field = createFlowField(mountedModel, glowTexture, bank, cells);
		const traffic = createTokenTraffic(mountedModel, field, glowTexture);
		ambient.keepClearOf(
			mountedModel.nodes.map((node) => ({ centre: node.position, radius: STATION_CLEARANCE }))
		);
		scene.add(field.group, traffic.group);
		return { field, traffic };
	}

	function unmountModel({ field, traffic }: MountedFlow): void {
		scene.remove(field.group, traffic.group);
		field.dispose();
		traffic.dispose();
	}

	let mounted = mountModel(model);

	function rebuild(rebuiltModel: FlowModel): void {
		unmountModel(mounted);
		mounted = mountModel(rebuiltModel);
	}

	function dispose(): void {
		unmountModel(mounted);
		backdrop.dispose();
		ambient.dispose();
		bank.dispose();
		cells.dispose();
		glowTexture.dispose();
	}

	return {
		scene,
		get mounted() {
			return mounted;
		},
		ambient,
		cells,
		rebuild,
		dispose
	};
}
