<script lang="ts">
	import ChatbotAllowancePill from './ChatbotAllowancePill.svelte';
	import { rungFor } from '$lib/data/modelLadder';

	let {
		chatbotName,
		modelId,
		creditsPerQuestion,
		remaining,
		allowance
	}: {
		chatbotName: string;
		modelId: string;
		creditsPerQuestion: number;
		remaining: number;
		allowance: number;
	} = $props();

	const modelName = $derived(rungFor(modelId).name);
</script>

<header class="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3">
	<div class="flex min-w-0 flex-col">
		<h1 class="truncate font-display text-lg font-medium">{chatbotName}</h1>
		<p class="text-xs text-chalk/50">Claude {modelName} · from {creditsPerQuestion} credits a question</p>
	</div>
	<ChatbotAllowancePill {remaining} {allowance} />
</header>
