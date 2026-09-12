export type VisemeShape = { jawOpen: number; mouthWidth: number; lipRound: number };

const visemeShapes = {
	rest: { jawOpen: 0.04, mouthWidth: 0, lipRound: 0 },
	ah: { jawOpen: 0.72, mouthWidth: 0.1, lipRound: 0.05 },
	ee: { jawOpen: 0.26, mouthWidth: 0.7, lipRound: 0 },
	oh: { jawOpen: 0.55, mouthWidth: -0.2, lipRound: 0.7 },
	oo: { jawOpen: 0.3, mouthWidth: -0.4, lipRound: 0.9 },
	mm: { jawOpen: 0, mouthWidth: 0.05, lipRound: 0.15 },
	fv: { jawOpen: 0.14, mouthWidth: 0.3, lipRound: 0.1 },
	tap: { jawOpen: 0.2, mouthWidth: 0.12, lipRound: 0.08 }
} satisfies Record<string, VisemeShape>;

export type VisemeName = keyof typeof visemeShapes;

const letterVisemes: Record<string, VisemeName> = {
	a: 'ah', e: 'ee', i: 'ee', y: 'ee', o: 'oh', u: 'oo', w: 'oo',
	m: 'mm', b: 'mm', p: 'mm', f: 'fv', v: 'fv'
};

export function shapeForViseme(name: VisemeName): VisemeShape {
	return visemeShapes[name];
}

export function visemesForSentence(sentence: string): VisemeName[] {
	const visemes: VisemeName[] = [];
	for (const character of sentence.toLowerCase()) {
		if (!/[a-z]/.test(character)) {
			visemes.push('rest');
			continue;
		}
		visemes.push(letterVisemes[character] ?? 'tap');
	}
	visemes.push('rest');
	return visemes;
}
