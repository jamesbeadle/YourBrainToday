<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { requestTokenRevoke } from './apiTokenRequests';
	import type { BrainApiToken } from '$lib/data/brainApiTypes';

	let {
		tokens,
		onRevoked
	}: { tokens: BrainApiToken[]; onRevoked: (tokenId: string) => void } = $props();

	let revokingId = $state<string | null>(null);

	async function revokeToken(tokenId: string) {
		if (revokingId !== null) return;
		revokingId = tokenId;
		await requestTokenRevoke(tokenId);
		onRevoked(tokenId);
		revokingId = null;
		await invalidateAll();
	}

	function shortDate(value: string | null): string {
		if (value === null) return 'never';
		return new Date(value).toLocaleDateString();
	}
</script>

{#if tokens.length > 0}
	<div class="flex flex-col gap-2">
		<h3 class="font-display text-xs tracking-widest text-chalk/50 uppercase">Active tokens</h3>
		{#each tokens as token (token.id)}
			<div class="flex items-center gap-3 rounded-xl border border-hairline px-3 py-2">
				<div class="min-w-0 flex-1">
					<p class="truncate text-sm text-chalk">{token.name}</p>
					<p class="text-xs text-chalk/50">
						ybt_…{token.tokenHint} · created {shortDate(token.createdAt)} · last used
						{shortDate(token.lastUsedAt)}
					</p>
				</div>
				<button
					type="button"
					onclick={() => revokeToken(token.id)}
					disabled={revokingId !== null}
					class="rounded-full border border-hairline px-3 py-1 font-display text-xs
						text-caution/80 transition hover:border-caution/60 hover:text-caution
						disabled:opacity-40"
				>
					{revokingId === token.id ? 'Revoking…' : 'Revoke'}
				</button>
			</div>
		{/each}
	</div>
{/if}
