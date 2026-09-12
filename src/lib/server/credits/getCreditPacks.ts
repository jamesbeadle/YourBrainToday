import type { SupabaseClient } from '@supabase/supabase-js';
import { creditPacks, isSamePack, type CreditPackDefinition } from '$lib/data/creditPacks';

export type CreditPack = CreditPackDefinition;

// The table is what the checkout charges; creditPacks.ts is what the usage
// prices assume. They must agree, or a cheaper pack than the pricing knows
// about would sell credits below the value every question is priced at.
export async function getCreditPacks(supabase: SupabaseClient): Promise<CreditPack[]> {
	const { data, error } = await supabase.from('credit_packs').select().order('price_pence');
	if (error) throw error;
	const packs = data.map((row) => ({
		id: row.id,
		name: row.name,
		credits: row.credits,
		pricePence: row.price_pence
	}));
	packs.forEach(assertPackIsKnown);
	return packs;
}

function assertPackIsKnown(pack: CreditPack): void {
	const isKnown = creditPacks.some((known) => isSamePack(pack, known));
	if (!isKnown) throw new Error(`credit_pack_mismatch:${pack.id}`);
}
