<script lang="ts">
	import { enhance } from '$app/forms';
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import ModelSlider from '$lib/components/site/ModelSlider.svelte';
	import { rungFor } from '$lib/data/modelLadder';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { ChatbotSummary } from '$lib/data/chatbotTypes';

	let { chatbot }: { chatbot: ChatbotSummary } = $props();

	const renameTracker = new FormTracker();
	const modelTracker = new FormTracker();
	let chosenModel = $derived(chatbot.modelId);
	let isDeleteModalOpen = $state(false);
</script>

<section class="flex flex-col gap-5 rounded-2xl border border-hairline bg-carriage p-5">
	<h2 class="font-display text-lg font-medium">Settings</h2>
	<form
		method="POST"
		action="?/rename"
		use:enhance={renameTracker.submit()}
		class="flex flex-col gap-2"
	>
		<div class="flex items-center gap-2">
			<input
				type="text"
				name="name"
				required
				maxlength="80"
				value={chatbot.name}
				class="w-72 max-w-full rounded-xl border border-hairline bg-night px-4 py-2 text-sm
					text-chalk outline-none focus:border-signal"
			/>
			<SubmitButton isSaving={renameTracker.isSaving}>Rename</SubmitButton>
		</div>
		<FormErrorNote message={renameTracker.errorMessage} />
	</form>
	<form
		method="POST"
		action="?/setModel"
		use:enhance={modelTracker.submit()}
		class="flex flex-col gap-3 border-t border-hairline pt-5"
	>
		<div class="flex flex-col gap-1">
			<h3 class="font-display text-sm text-chalk">Model</h3>
			<p class="text-xs leading-relaxed text-chalk/60">
				What the bot answers with. Each question reserves the model's floor from the pool and
				settles to what the answer actually cost; you can override it per member in the table.
			</p>
		</div>
		<ModelSlider bind:modelId={chosenModel} />
		<FormErrorNote message={modelTracker.errorMessage} />
		<SubmitButton
			isSaving={modelTracker.isSaving}
			disabled={rungFor(chosenModel).modelId === rungFor(chatbot.modelId).modelId}
			class="self-start rounded-full bg-go px-5 py-2 font-display text-sm font-medium text-night
				transition hover:brightness-110 disabled:opacity-40"
		>
			Save model
		</SubmitButton>
	</form>
	<div class="flex flex-col gap-2 border-t border-hairline pt-5">
		<h3 class="font-display text-sm text-signal">Delete this chatbot</h3>
		<p class="text-xs leading-relaxed text-chalk/60">
			Members lose access and their conversations go with it. Any credits left in the pool
			({chatbot.poolCredits}) are not returned — pausing keeps them.
		</p>
		<button
			type="button"
			onclick={() => (isDeleteModalOpen = true)}
			class="self-start rounded-full border border-signal/60 px-4 py-2 font-display text-sm
				text-signal transition hover:bg-signal hover:text-night"
		>
			Delete chatbot
		</button>
	</div>
</section>

<DangerConfirmModal
	bind:isOpen={isDeleteModalOpen}
	title={`Delete ${chatbot.name}?`}
	description="This removes the bot, its members and every conversation. It cannot be undone."
	action="?/deleteChatbot"
	fields={{}}
	submitLabel="Delete chatbot"
	confirmWord="DELETE"
/>
