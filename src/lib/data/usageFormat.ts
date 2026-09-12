import { formatPenceAsPounds } from './creditPricing';

const britishLocale = 'en-GB';

export function formatCount(count: number): string {
	return count.toLocaleString(britishLocale);
}

// A margin can be negative; the sign sits before the pound sign.
export function formatSignedPence(pence: number): string {
	const pounds = formatPenceAsPounds(Math.abs(pence));
	return pence < 0 ? `−${pounds}` : pounds;
}
