import { Vector3 } from 'three';
import type { Viewpoint } from '../constellation/focusChoreography';
import type { FlowModel, FlowNode } from './flowTypes';

const HOME_DISTANCE_SHARE = 1.75;
const SMALLEST_HOME_DISTANCE = 8;
const NODE_DISTANCE = 2.2;
const NODE_LIFT = 0.5;
const HOME_VIEW_DIRECTION = new Vector3(1, 0.32, 0.28).normalize();

export function flowHomeViewpoint(model: FlowModel): Viewpoint {
	const reach = model.nodes.reduce((farthest, node) => Math.max(farthest, node.position.length()), 0);
	const distance = Math.max(SMALLEST_HOME_DISTANCE, reach * HOME_DISTANCE_SHARE);
	return { position: HOME_VIEW_DIRECTION.clone().multiplyScalar(distance), target: new Vector3() };
}

export function nodeViewpoint(node: FlowNode): Viewpoint {
	const outward = node.position.lengthSq() === 0 ? HOME_VIEW_DIRECTION.clone() : node.position.clone().normalize();
	const position = node.position
		.clone()
		.addScaledVector(outward, NODE_DISTANCE)
		.add(new Vector3(0, NODE_LIFT, 0));
	return { position, target: node.position.clone() };
}
