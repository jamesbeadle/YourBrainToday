import { Vector3 } from 'three';
import type { Viewpoint } from '../constellation/focusChoreography';
import type { BrainRegion, RegionModel } from './regionTypes';

const HOME_DISTANCE_SHARE = 2.1;
const SMALLEST_HOME_DISTANCE = 9;
const REGION_DISTANCE_SHARE = 2.4;
const REGION_CLEARANCE = 1.7;
const HOME_VIEW_DIRECTION = new Vector3(1, 0.42, 0.8).normalize();

export function regionHomeViewpoint(model: RegionModel): Viewpoint {
	const reach = model.regions.reduce(
		(farthest, region) => Math.max(farthest, region.centre.length() + region.radius),
		0
	);
	const distance = Math.max(SMALLEST_HOME_DISTANCE, reach * HOME_DISTANCE_SHARE);
	return { position: HOME_VIEW_DIRECTION.clone().multiplyScalar(distance), target: new Vector3() };
}

export function regionViewpoint(region: BrainRegion): Viewpoint {
	const outward = region.centre.lengthSq() === 0 ? HOME_VIEW_DIRECTION.clone() : region.centre.clone().normalize();
	const distance = region.radius * REGION_DISTANCE_SHARE + REGION_CLEARANCE;
	return {
		position: region.centre.clone().addScaledVector(outward, distance),
		target: region.centre.clone()
	};
}
