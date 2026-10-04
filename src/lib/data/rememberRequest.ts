const rememberOpening = /^(please\s+)?remember\b/i;

export function isRememberRequest(message: string): boolean {
	return rememberOpening.test(message.trim());
}
