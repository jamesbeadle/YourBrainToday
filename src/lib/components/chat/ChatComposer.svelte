<script lang="ts">
	let {
		onSend,
		isDisabled,
		placeholder = 'Tell the agent about your business…'
	}: { onSend: (text: string) => void; isDisabled: boolean; placeholder?: string } = $props();

	let draft = $state('');

	function sendDraft(event: SubmitEvent) {
		event.preventDefault();
		const text = draft.trim();
		if (text === '') return;
		onSend(text);
		draft = '';
	}
</script>

<form onsubmit={sendDraft} class="flex gap-3">
	<input
		bind:value={draft}
		{placeholder}
		aria-label={placeholder}
		class="flex-1 rounded-full border border-hairline bg-night px-5 py-3 text-chalk outline-none
			placeholder:text-chalk/40 focus:border-signal"
	/>
	<button
		type="submit"
		disabled={isDisabled}
		class="rounded-full bg-signal px-6 py-3 font-display text-sm font-medium text-night
			transition hover:brightness-110 disabled:opacity-40"
	>
		Send
	</button>
</form>
