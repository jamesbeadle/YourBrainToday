<script lang="ts">
	import { enhance } from '$app/forms';
	import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

	let {
		item,
		detail = '',
		shouldShowBody = true
	}: { item: KbBrainItem; detail?: string; shouldShowBody?: boolean } = $props();
</script>

<li class="flex items-start justify-between gap-3 py-3">
	<div class="flex min-w-0 flex-col gap-0.5">
		<p class="font-display text-sm font-medium">{item.title}</p>
		{#if detail !== ''}
			<p class="text-xs text-chalk/50">{detail}</p>
		{/if}
		{#if shouldShowBody && item.body !== ''}
			<p class="line-clamp-3 text-sm whitespace-pre-line text-chalk/70">{item.body}</p>
		{/if}
	</div>
	<form method="POST" action="?/deleteItem" use:enhance>
		<input type="hidden" name="itemId" value={item.id} />
		<button
			type="submit"
			aria-label={`Delete ${item.title}`}
			class="rounded-full border border-hairline px-2.5 py-1 text-xs text-chalk/40 transition
				hover:border-signal hover:text-signal"
		>
			✕
		</button>
	</form>
</li>
