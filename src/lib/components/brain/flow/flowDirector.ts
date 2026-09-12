import { createCameraFlight } from '../constellation/cameraFlight';
import { flowHomeViewpoint, nodeViewpoint } from './flowChoreography';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { PerspectiveCamera } from 'three';
import type { FlowScene } from './flowSceneAssembly';
import type { FlowHover, FlowModel } from './flowTypes';

type DirectorDependencies = {
	camera: PerspectiveCamera;
	controls: OrbitControls;
	view: FlowScene;
	model: FlowModel;
	isAnimated: boolean;
};

export type FlowDirector = {
	hover: (hover: Pick<FlowHover, 'nodeId' | 'edgeId'> | null) => void;
	focusNode: (nodeId: string | null) => void;
	refresh: (model: FlowModel) => void;
	update: (deltaSeconds: number) => void;
};

export function createFlowDirector(dependencies: DirectorDependencies): FlowDirector {
	const { camera, controls, view, isAnimated } = dependencies;
	const flight = createCameraFlight(camera, controls.target);
	let model = dependencies.model;

	const home = flowHomeViewpoint(model);
	camera.position.copy(home.position);
	controls.target.copy(home.target);

	function hover(hovered: Pick<FlowHover, 'nodeId' | 'edgeId'> | null): void {
		view.mounted.field.setHover(hovered);
	}

	function focusNode(nodeId: string | null): void {
		controls.autoRotate = nodeId === null && isAnimated;
		const node = model.nodes.find((candidate) => candidate.id === nodeId);
		const viewpoint = node === undefined ? flowHomeViewpoint(model) : nodeViewpoint(node);
		flight.flyTo(viewpoint.position, viewpoint.target);
	}

	function refresh(refreshedModel: FlowModel): void {
		model = refreshedModel;
	}

	function update(deltaSeconds: number): void {
		flight.update(camera, controls.target, deltaSeconds);
	}

	return { hover, focusNode, refresh, update };
}
