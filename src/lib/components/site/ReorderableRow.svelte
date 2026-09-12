<script lang="ts">
	import type { ListReorder } from '$lib/client/listReorder.svelte';
	import type { Snippet } from 'svelte';

	let {
		listReorder,
		rowId,
		groupId = null,
		tag = 'li',
		class: rowClasses = '',
		children
	}: {
		listReorder: ListReorder;
		rowId: string;
		groupId?: string | null;
		tag?: 'li' | 'tr';
		class?: string;
		children: Snippet<[Snippet]>;
	} = $props();

	const isDragged = $derived(listReorder.draggedId === rowId);
	const isDropTarget = $derived(listReorder.dropTargetId === rowId);
	const dropIndicatorClass = $derived.by(() => {
		if (!isDropTarget) return '';
		if (listReorder.dropPlacement === 'before') return 'shadow-[inset_0_2px_0_0_var(--color-go)]';
		if (listReorder.dropPlacement === 'after') return 'shadow-[inset_0_-2px_0_0_var(--color-go)]';
		return 'shadow-[inset_0_0_0_2px_var(--color-go)]';
	});

	function beginHandleDrag(event: PointerEvent) {
		event.preventDefault();
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		lockTextSelection(true);
		listReorder.beginDrag(rowId, groupId);
	}

	function finishHandleDrag() {
		lockTextSelection(false);
		listReorder.completeDrop();
	}

	function cancelHandleDrag() {
		lockTextSelection(false);
		listReorder.reset();
	}

	function lockTextSelection(isLocked: boolean) {
		document.body.style.userSelect = isLocked ? 'none' : '';
	}
</script>

{#snippet dragHandle()}
	<button
		type="button"
		tabindex="-1"
		aria-hidden="true"
		title="Drag to reorder"
		onpointerdown={beginHandleDrag}
		onpointermove={(event) => listReorder.trackDrag(event)}
		onpointerup={finishHandleDrag}
		onpointercancel={cancelHandleDrag}
		class="cursor-grab touch-none px-1 text-chalk/30 transition select-none hover:text-chalk/70
			active:cursor-grabbing"
	>
		⠿
	</button>
{/snippet}

<svelte:element
	this={tag}
	data-reorder-list={listReorder.listId}
	data-reorder-row={rowId}
	data-reorder-group={groupId ?? ''}
	class={`${rowClasses} ${dropIndicatorClass}`}
	class:opacity-40={isDragged}
>
	{@render children(dragHandle)}
</svelte:element>
