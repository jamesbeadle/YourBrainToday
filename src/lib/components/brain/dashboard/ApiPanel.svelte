<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import AgentBriefingPanel from './AgentBriefingPanel.svelte';
	import ApiTokenList from './ApiTokenList.svelte';
	import MintedTokenNotice from './MintedTokenNotice.svelte';
	import { requestTokenCreate } from './apiTokenRequests';
	import type { BrainApiToken, MintedBrainApiToken } from '$lib/data/brainApiTypes';

	let {
		brainId,
		tokens
	}: {
		brainId: string;
		tokens: BrainApiToken[];
	} = $props();

	let draftName = $state('');
	let isCreating = $state(false);
	let errorMessage = $state('');
	let minted = $state<MintedBrainApiToken | null>(null);

	const baseUrl = $derived(`${page.url.origin}/api/v1/brains/${brainId}`);

	async function createToken(submitEvent: SubmitEvent) {
		submitEvent.preventDefault();
		const name = draftName.trim();
		if (name === '' || isCreating) return;
		isCreating = true;
		errorMessage = '';
		const outcome = await requestTokenCreate(brainId, name);
		isCreating = false;
		if (!outcome.isCreated) {
			errorMessage = outcome.message;
			return;
		}
		minted = outcome.minted;
		draftName = '';
		await invalidateAll();
	}

	function forgetMintedIfRevoked(tokenId: string) {
		if (minted?.id === tokenId) minted = null;
	}
</script>

<div class="flex flex-col gap-4 p-4">
	<p class="text-sm text-chalk/60">
		Use this brain from outside the site — from Claude, a script, or any agent. A token is the
		key: send it as a bearer header and the API serves the model index, individual pages, grounded
		answers, and a markdown export. Questions asked through the API spend your credits (10 per
		question); reading pages and exporting are free.
	</p>

	<form class="flex items-center gap-2" onsubmit={createToken}>
		<input
			type="text"
			bind:value={draftName}
			placeholder="Token name — e.g. Claude on my laptop"
			class="min-w-0 flex-1 rounded-xl border border-hairline bg-transparent px-3 py-2 text-sm
				text-chalk placeholder:text-chalk/30 focus:border-chalk/40 focus:outline-none"
		/>
		<button
			type="submit"
			disabled={isCreating || draftName.trim() === ''}
			class="rounded-full border border-hairline px-4 py-1.5 font-display text-xs text-chalk/70
				transition hover:border-chalk/40 hover:text-chalk disabled:opacity-40"
		>
			{isCreating ? 'Creating…' : 'Create token'}
		</button>
	</form>
	{#if errorMessage !== ''}
		<p class="text-xs text-caution">{errorMessage}</p>
	{/if}

	{#if minted !== null}
		<MintedTokenNotice {minted} />
	{/if}

	<ApiTokenList {tokens} onRevoked={forgetMintedIfRevoked} />

	<AgentBriefingPanel {baseUrl} />
</div>
