<script lang="ts">
	import BrandMark from '../site/BrandMark.svelte';
	import MarkdownBody from '../brain/MarkdownBody.svelte';

	let { speaker, body }: { speaker: 'member' | 'bot'; body: string } = $props();
</script>

{#if speaker === 'bot'}
	<div class="flex items-start gap-3">
		<BrandMark size={30} />
		<div class="max-w-prose rounded-2xl rounded-tl-sm border border-hairline bg-night px-4 py-3">
			<MarkdownBody markdown={body} />
		</div>
	</div>
{:else}
	<div class="flex justify-end">
		<p class="max-w-prose rounded-2xl rounded-tr-sm bg-signal px-4 py-3 font-medium text-night">
			{body}
		</p>
	</div>
{/if}
