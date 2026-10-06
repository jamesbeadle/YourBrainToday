const britishLocale = 'en-GB';

export function formatBritishDate(isoDate: string): string {
	return new Date(isoDate).toLocaleDateString(britishLocale, {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});
}
