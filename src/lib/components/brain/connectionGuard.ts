export const connectionLostMessage = 'The connection dropped — please try again.';

type Failed = { status: 'failed'; message: string };

/** Turns a thrown network error into a failed outcome, so no caller is left waiting. */
export async function guardingConnection<Outcome>(
	work: () => Promise<Outcome>
): Promise<Outcome | Failed> {
	try {
		return await work();
	} catch {
		return { status: 'failed', message: connectionLostMessage };
	}
}
