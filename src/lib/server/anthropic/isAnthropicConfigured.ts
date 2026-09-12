import { env } from '$env/dynamic/private';

export function isAnthropicConfigured(): boolean {
	return (env.ANTHROPIC_API_KEY ?? '') !== '';
}
