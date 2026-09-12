import {
	BoxGeometry, Color, DynamicDrawUsage, InstancedMesh, Matrix4, MeshLambertMaterial
} from 'three';
import { collectCubePlacements, type CubePlacement } from './cubePlacements';
import { eyeShadeAt, restingLook } from './eyeShading';
import { CUBE_FILL, CUBE_PITCH } from './reliefPalette';
import { colourForShade } from './reliefShade';

export type VoxelFace = { mesh: InstancedMesh; placements: CubePlacement[] };

export function buildVoxelFace(): VoxelFace {
	const placements = collectCubePlacements();
	const side = CUBE_PITCH * CUBE_FILL;
	const geometry = new BoxGeometry(side, side, side);
	const mesh = new InstancedMesh(geometry, new MeshLambertMaterial(), placements.length);
	const matrix = new Matrix4();
	const colour = new Color();
	placements.forEach((placement, index) => {
		matrix.makeScale(placement.size, placement.size, placement.size);
		matrix.setPosition(placement.across, placement.up, placement.depth);
		mesh.setMatrixAt(index, matrix);
		const shade = eyeShadeAt(placement.across, placement.up, placement.shade, restingLook);
		mesh.setColorAt(index, colourForShade(shade, colour));
	});
	mesh.instanceMatrix.setUsage(DynamicDrawUsage);
	mesh.instanceMatrix.needsUpdate = true;
	mesh.instanceColor?.setUsage(DynamicDrawUsage);
	mesh.frustumCulled = false;
	return { mesh, placements };
}
