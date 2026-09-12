export type Account = { id: string; name: string; email: string };

export function parseAccountRecord(row: Record<string, unknown>): Account {
	const email = String(row.email ?? '');
	const displayName = String(row.display_name ?? '').trim();
	return { id: row.id as string, name: displayName === '' ? email : displayName, email };
}
