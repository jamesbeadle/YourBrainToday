import type { FaceExpressionName } from '$lib/data/faceChatTypes';
import { neutralParameters, type FaceRigParameters } from './faceRigParameters';

export type ExpressionName = FaceExpressionName;

export const expressionLibrary: Record<ExpressionName, FaceRigParameters> = {
	neutral: neutralParameters,
	happy: {
		browRaise: 0.25,
		eyeOpenness: 0.8,
		mouthCurve: 0.9,
		jawOpen: 0.24,
		mouthWidth: 0.5,
		lipRound: 0
	},
	curious: {
		browRaise: 0.6,
		eyeOpenness: 1,
		mouthCurve: 0.2,
		jawOpen: 0.1,
		mouthWidth: -0.1,
		lipRound: 0.3
	},
	surprised: {
		browRaise: 0.85,
		eyeOpenness: 1.15,
		mouthCurve: 0,
		jawOpen: 0.62,
		mouthWidth: -0.15,
		lipRound: 0.45
	},
	focused: {
		browRaise: -0.55,
		eyeOpenness: 0.55,
		mouthCurve: -0.2,
		jawOpen: 0.02,
		mouthWidth: 0.15,
		lipRound: 0
	}
};

export const expressionNames = Object.keys(expressionLibrary) as ExpressionName[];
