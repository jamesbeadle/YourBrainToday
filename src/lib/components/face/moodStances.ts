export type FaceMood = 'idle' | 'listening' | 'thinking' | 'speaking';

export type MoodStance = {
	anchor: { across: number; up: number; forward: number };
	roam: { across: number; up: number };
	gazeAnchor: { across: number; up: number };
	gazeRoam: number;
	pointerPull: number;
	tilt: number;
};

export const moodStances: Record<FaceMood, MoodStance> = {
	idle: {
		anchor: { across: 0, up: 0, forward: 0 },
		roam: { across: 0.45, up: 0.26 },
		gazeAnchor: { across: 0, up: 0 },
		gazeRoam: 0.5,
		pointerPull: 0.7,
		tilt: 0
	},
	listening: {
		anchor: { across: 0, up: -0.2, forward: 0.4 },
		roam: { across: 0.05, up: 0.03 },
		gazeAnchor: { across: 0, up: -0.55 },
		gazeRoam: 0.08,
		pointerPull: 0.15,
		tilt: 0.09
	},
	thinking: {
		anchor: { across: 0.28, up: 0.22, forward: -0.3 },
		roam: { across: 0.16, up: 0.1 },
		gazeAnchor: { across: 0.55, up: 0.6 },
		gazeRoam: 0.25,
		pointerPull: 0,
		tilt: -0.07
	},
	speaking: {
		anchor: { across: 0, up: 0, forward: 0.18 },
		roam: { across: 0.09, up: 0.05 },
		gazeAnchor: { across: 0, up: 0 },
		gazeRoam: 0.12,
		pointerPull: 0.85,
		tilt: 0
	}
};
