export const HONEY = 0xffc857;
export const HONEY_WHITE = 0xfff3d6;
export const FILAMENT = 0xaeb8d2;

const swarmColours = [
	0x9db6ff, 0x8fe6bd, 0xc4aeff, 0xffab8a, 0x9fe8e8, 0xf2a1c0, 0xa8e08a, 0xffd89a
];

export function swarmColourFor(swarmIndex: number): number {
	return swarmColours[swarmIndex % swarmColours.length];
}
