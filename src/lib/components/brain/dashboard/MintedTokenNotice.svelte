<script lang="ts">
	import CopyButton from '$lib/components/site/CopyButton.svelte';
	import type { MintedBrainApiToken } from '$lib/data/brainApiTypes';

	let { minted }: { minted: MintedBrainApiToken } = $props();
</script>

<div class="flex flex-col gap-2 rounded-xl border border-go/40 p-3">
	<p class="text-xs text-go">
		“{minted.name}” created — copy it now, it is only shown this once.
	</p>
	<div class="flex items-center gap-2">
		<code class="min-w-0 flex-1 overflow-x-auto rounded-lg bg-chalk/5 px-2 py-1.5 font-mono
			text-xs text-chalk">{minted.token}</code>
		<CopyButton text={minted.token} />
	</div>
</div>
