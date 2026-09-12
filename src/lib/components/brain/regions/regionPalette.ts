export const SECTION_HUES = [
	0x5fe0a8, 0x6f9bff, 0xffb64d, 0xb48cff, 0xff8a6a, 0x4fd8e6, 0xff7fb5, 0xb6ea55, 0xe28cff, 0xffd23f
];

export const UNFILED_TINT = 0x8a93a8;

const HUE_STRIDE = 3;

export function sectionHueAt(regionIndex: number): number {
	return SECTION_HUES[(regionIndex * HUE_STRIDE) % SECTION_HUES.length];
}
