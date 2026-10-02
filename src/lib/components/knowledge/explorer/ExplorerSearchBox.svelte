<script lang="ts">
	import { inputClasses, quietButtonClasses } from '../../site/formStyles';

	let {
		text = $bindable(''),
		isSearching,
		onSearchBodies
	}: { text?: string; isSearching: boolean; onSearchBodies: () => void } = $props();

	function searchOnEnter(event: KeyboardEvent): void {
		if (event.key !== 'Enter') return;
		event.preventDefault();
		onSearchBodies();
	}
</script>

<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
	<input
		type="search"
		bind:value={text}
		onkeydown={searchOnEnter}
		placeholder="Find a page, an event, a person, a task…"
		aria-label="Find in this knowledge base"
		class={[inputClasses, 'min-w-0 flex-1']}
	/>
	<button
		type="button"
		onclick={onSearchBodies}
		disabled={isSearching || text.trim() === ''}
		class={[quietButtonClasses, 'shrink-0 disabled:opacity-40']}
	>
		{isSearching ? 'Searching…' : 'Search bodies'}
	</button>
</div>
