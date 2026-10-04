const fallbackMessage = 'Something went wrong — please try again.';

/** The message a failed response carries in its JSON body, or the fallback when it carries none. */
export async function messageFrom(response: Response): Promise<string> {
	const payload = await response.json().catch(() => null);
	if (payload === null || typeof payload.message !== 'string') return fallbackMessage;
	return payload.message;
}
