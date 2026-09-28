<script lang="ts">
	import { enhance } from '$app/forms';
	import PreferredAnswerForm from './PreferredAnswerForm.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { rulingLineFor } from './questionLogLines';
	import type { ChatbotRuling } from '$lib/data/chatbotRulings';

	let { rulings }: { rulings: ChatbotRuling[] } = $props();

	const removeTracker = new FormTracker();
	let isAdding = $state(false);

	const summaryLabel = $derived(
		rulings.length === 1 ? '1 preferred answer' : `${rulings.length} preferred answers`
	);
</script>

<details class="border-t border-hairline pt-4" open={rulings.length === 0 ? undefined : true}>
	<summary class="cursor-pointer text-sm text-chalk/60 transition hover:text-chalk">
		{summaryLabel}
	</summary>
	<p class="mt-2 text-xs text-chalk/50">
		When a member asks one of these, the bot answers in your words — no credits, no guessing.
	</p>
	{#if rulings.length > 0}
		<ul class="mt-3 flex flex-col divide-y divide-hairline text-sm">
			{#each rulings as ruling (ruling.id)}
				<li class="flex flex-col gap-1 py-2">
					<div class="flex items-start justify-between gap-3">
						<p class="text-chalk">“{ruling.question}”</p>
						<form method="POST" action="?/removeRuling" use:enhance={removeTracker.submit()}>
							<input type="hidden" name="rulingId" value={ruling.id} />
							<SubmitButton
								isSaving={removeTracker.isSaving}
								savingLabel="Removing…"
								class="text-xs text-chalk/40 transition hover:text-caution"
							>
								Remove
							</SubmitButton>
						</form>
					</div>
					<p class="whitespace-pre-line text-chalk/60">{ruling.preferredAnswer}</p>
					<p class="text-xs text-chalk/40">{rulingLineFor(ruling)}</p>
				</li>
			{/each}
		</ul>
	{/if}
	{#if isAdding}
		<div class="mt-3">
			<PreferredAnswerForm onDone={() => (isAdding = false)} />
		</div>
	{:else}
		<button
			type="button"
			onclick={() => (isAdding = true)}
			class="mt-3 rounded-full border border-hairline px-3 py-1.5 text-xs text-chalk/60 transition
				hover:border-signal hover:text-signal"
		>
			Add a preferred answer
		</button>
	{/if}
</details>
