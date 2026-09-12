<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		isSaving = false,
		disabled = false,
		savingLabel = 'Saving…',
		class: buttonClasses = `rounded-full bg-go px-6 py-2.5 font-display text-sm font-medium
			text-night transition hover:brightness-110`,
		children
	}: {
		isSaving?: boolean;
		disabled?: boolean;
		savingLabel?: string;
		class?: string;
		children: Snippet;
	} = $props();
</script>

<button
	type="submit"
	disabled={isSaving || disabled}
	aria-busy={isSaving}
	class={`inline-flex items-center justify-center gap-2 whitespace-nowrap
		disabled:cursor-not-allowed ${isSaving ? 'opacity-70' : ''} ${buttonClasses}`}
>
	{#if isSaving}
		<span
			class="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current
				border-t-transparent"
			aria-hidden="true"
		></span>
		{savingLabel}
	{:else}
		{@render children()}
	{/if}
</button>
