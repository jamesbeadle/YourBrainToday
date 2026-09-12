import { createCameraFlight } from '../constellation/cameraFlight';
import { regionHomeViewpoint, regionViewpoint } from './regionChoreography';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { PerspectiveCamera } from 'three';
import type { RegionScene } from './regionSceneAssembly';
import type { RegionModel } from './regionTypes';

type DirectorDependencies = {
	camera: PerspectiveCamera;
	controls: OrbitControls;
	view: RegionScene;
	model: RegionModel;
	isAnimated: boolean;
};

export type RegionDirector = {
	hoverRegion: (regionId: string | null) => void;
	focusRegion: (regionId: string | null) => void;
	refresh: (model: RegionModel) => void;
	update: (deltaSeconds: number) => void;
};

export function createRegionDirector(dependencies: DirectorDependencies): RegionDirector {
	const { camera, controls, view, isAnimated } = dependencies;
	const flight = createCameraFlight(camera, controls.target);
	let model = dependencies.model;
	let focusedId: string | null = null;
	let hoveredId: string | null = null;

	const home = regionHomeViewpoint(model);
	camera.position.copy(home.position);
	controls.target.copy(home.target);

	function litRegionId(): string | null {
		return hoveredId ?? focusedId;
	}

	function hoverRegion(regionId: string | null): void {
		hoveredId = regionId;
		view.field.setHover(litRegionId());
	}

	function focusRegion(regionId: string | null): void {
		focusedId = regionId;
		view.field.setHover(litRegionId());
		controls.autoRotate = regionId === null && isAnimated;
		const region = model.regions.find((candidate) => candidate.id === regionId);
		const viewpoint = region === undefined ? regionHomeViewpoint(model) : regionViewpoint(region);
		flight.flyTo(viewpoint.position, viewpoint.target);
	}

	function refresh(refreshedModel: RegionModel): void {
		model = refreshedModel;
		view.field.setHover(litRegionId());
	}

	function update(deltaSeconds: number): void {
		flight.update(camera, controls.target, deltaSeconds);
	}

	return { hoverRegion, focusRegion, refresh, update };
}
