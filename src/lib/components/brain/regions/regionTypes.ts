import type { Vector3 } from 'three';

export type RegionNeuron = { id: string; title: string; isEpisode: boolean; position: Vector3 };

export type BrainRegion = {
	id: string;
	name: string;
	caption: string;
	colour: number;
	isUnfiled: boolean;
	centre: Vector3;
	radius: number;
	neurons: RegionNeuron[];
};

export type RegionModel = { regions: BrainRegion[] };

export type RegionHover = { regionId: string; x: number; y: number };

export type RegionCallbacks = {
	onHover: (hover: RegionHover | null) => void;
	onSelectRegion: (regionId: string | null) => void;
};
