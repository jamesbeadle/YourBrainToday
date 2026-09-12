export type FaceRigParameters = {
	browRaise: number;
	eyeOpenness: number;
	mouthCurve: number;
	jawOpen: number;
	mouthWidth: number;
	lipRound: number;
};

export const neutralParameters: FaceRigParameters = {
	browRaise: 0,
	eyeOpenness: 1,
	mouthCurve: 0.08,
	jawOpen: 0.04,
	mouthWidth: 0,
	lipRound: 0
};

export function copyParameters(source: FaceRigParameters): FaceRigParameters {
	return { ...source };
}

export function blendTowards(
	current: FaceRigParameters,
	target: FaceRigParameters,
	rate: number,
	deltaSeconds: number
): void {
	const amount = Math.min(1, rate * deltaSeconds);
	for (const key of Object.keys(current) as (keyof FaceRigParameters)[]) {
		current[key] = current[key] + (target[key] - current[key]) * amount;
	}
}
