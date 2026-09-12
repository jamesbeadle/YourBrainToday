<script lang="ts">
	import KnowledgeBaseSwitcherMenu from './KnowledgeBaseSwitcherMenu.svelte';
	import type { KnowledgeBaseSummary } from '$lib/data/knowledge/knowledgeTypes';

	let {
		knowledgeBases,
		currentKnowledgeBaseId
	}: {
		knowledgeBases: KnowledgeBaseSummary[];
		currentKnowledgeBaseId: string;
	} = $props();

	const fallbackName = 'Knowledge base';

	const currentName = $derived(
		knowledgeBases.find((knowledgeBase) => knowledgeBase.id === currentKnowledgeBaseId)?.name ??
			fallbackName
	);

	let isOpen = $state(false);

	const toggleMenu = () => (isOpen = !isOpen);
	const closeMenu = () => (isOpen = false);

	/** Escape closes the open menu and claims the key, so the page beneath does not act on it too. */
	function closeOnEscape(event: KeyboardEvent): void {
		if (!isOpen || event.key !== 'Escape') return;
		event.preventDefault();
		closeMenu();
	}
</script>

<svelte:window onkeydown={closeOnEscape} />

<div class="flex min-w-0 items-center gap-3">
	<span aria-hidden="true" class="h-5 w-px shrink-0 bg-hairline"></span>
	<div class="relative flex min-w-0">
		<button
			type="button"
			aria-label="Switch knowledge base"
			aria-expanded={isOpen}
			onclick={toggleMenu}
			class="flex min-w-0 items-center gap-1.5 font-display text-sm text-chalk/80 transition
				hover:text-chalk"
		>
			<span class="max-w-[40vw] truncate md:max-w-xs">{currentName}</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="h-4 w-4 shrink-0 text-chalk/50"
				aria-hidden="true"
			>
				<path d="m6 9 6 6 6-6" />
			</svg>
		</button>
		{#if isOpen}
			<KnowledgeBaseSwitcherMenu {knowledgeBases} {currentKnowledgeBaseId} onClose={closeMenu} />
		{/if}
	</div>
</div>
