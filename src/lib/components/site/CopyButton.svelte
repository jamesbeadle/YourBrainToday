<script lang="ts">
	let { text }: { text: string } = $props();

	const COPIED_NOTICE_MILLISECONDS = 1500;

	let isCopied = $state(false);

	async function copyToClipboard() {
		await navigator.clipboard.writeText(text);
		isCopied = true;
		setTimeout(() => (isCopied = false), COPIED_NOTICE_MILLISECONDS);
	}
</script>

<button
	type="button"
	onclick={copyToClipboard}
	class="rounded-full border border-hairline px-3 py-1 font-display text-xs text-chalk/70
		transition hover:border-chalk/40 hover:text-chalk"
>
	{isCopied ? 'Copied' : 'Copy'}
</button>
