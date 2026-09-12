<script lang="ts">
	import BrandMark from '../site/BrandMark.svelte';
	import type { ChatMessage } from '$lib/data/chatTypes';

	let { message }: { message: ChatMessage } = $props();

	const isFromAgent = $derived(message.author === 'agent');
</script>

{#if isFromAgent}
	<div class="flex items-start gap-3">
		<BrandMark size={30} />
		<p class="max-w-prose rounded-2xl rounded-tl-sm border border-hairline bg-night px-4 py-3">
			{message.text}
		</p>
	</div>
{:else}
	<div class="flex justify-end">
		<p class="max-w-prose rounded-2xl rounded-tr-sm bg-signal px-4 py-3 font-medium text-night">
			{message.text}
		</p>
	</div>
{/if}
