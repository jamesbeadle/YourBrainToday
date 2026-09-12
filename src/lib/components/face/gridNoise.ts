const HASH_PRIME_ACROSS = 374761393;
const HASH_PRIME_UP = 668265263;
const HASH_MIX = 1274126177;
const HASH_SHIFT = 13;
const UNSIGNED_RANGE = 4294967296;

export function noiseAt(column: number, row: number, salt: number): number {
	let hashed = (column * HASH_PRIME_ACROSS) ^ (row * HASH_PRIME_UP) ^ (salt * HASH_MIX);
	hashed = Math.imul(hashed ^ (hashed >>> HASH_SHIFT), HASH_MIX);
	hashed ^= hashed >>> 16;
	return (hashed >>> 0) / UNSIGNED_RANGE;
}
