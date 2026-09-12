import type { LedgerMovement } from './getLedgerMovements';

export type LedgerMovementKind = 'bought' | 'granted' | 'spent' | 'refunded';

const purchaseReasonPrefix = 'purchase:';
const purchaseReversalPrefix = 'purchase_refund:';
const adminAdjustmentPrefix = 'admin_adjustment:';
const refundReasonSuffix = '_refund';

// Bought credits came through a paid pack, and a reversed purchase takes
// them back out of bought; an admin adjustment moves granted either way; a
// refund hands a spend back; every other credit in is a grant (welcome,
// promo, gift, earning); every other credit out is a spend.
export function classifyLedgerMovement(movement: LedgerMovement): LedgerMovementKind {
	if (movement.reason.startsWith(purchaseReversalPrefix)) return 'bought';
	if (movement.reason.startsWith(adminAdjustmentPrefix)) return 'granted';
	if (movement.delta < 0) return 'spent';
	if (movement.reason.startsWith(purchaseReasonPrefix)) return 'bought';
	if (movement.reason.endsWith(refundReasonSuffix)) return 'refunded';
	return 'granted';
}
