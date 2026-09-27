import type { DomainBlockKind } from '$lib/data/brainTypes';

export const NIGHT_SKY = 0x0c0d11;
export const CHALK = 0xedeef3;
export const SIGNAL = 0xa78bff;
export const SILVER = 0xc9d2e6;
export const HALO = 0xd6ddf5;
export const STARLIGHT = 0x6c7694;
export const DENDRITE = 0x8ea3e0;
export const CROSSLINK = 0xa6b6ea;

export const kindColours: Record<DomainBlockKind, number> = {
	entity: 0x9db6ff,
	value_object: 0x8fe6bd,
	aggregate: 0xffd89a,
	domain_service: 0xc4aeff,
	domain_event: 0xffab8a,
	glossary: 0x9fe8e8,
	context_map: 0xedeef3
};

export function asCssColour(colour: number): string {
	return `#${colour.toString(16).padStart(6, '0')}`;
}
