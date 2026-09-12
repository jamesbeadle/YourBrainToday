<script lang="ts">
	let {
		selectedCount,
		isDeciding,
		onDecide
	}: {
		selectedCount: number;
		isDeciding: boolean;
		onDecide: (verdict: 'approve' | 'reject') => void;
	} = $props();
</script>

<div class="flex gap-2 border-t border-hairline p-3">
	<button
		type="button"
		disabled={isDeciding || selectedCount === 0}
		onclick={() => onDecide('approve')}
		class="flex-1 rounded-full bg-go px-4 py-2 font-display text-xs font-medium text-night
			transition hover:brightness-110 disabled:opacity-40"
	>
		Approve {selectedCount || ''}
	</button>
	<button
		type="button"
		disabled={isDeciding || selectedCount === 0}
		onclick={() => onDecide('reject')}
		class="flex-1 rounded-full border border-signal/60 px-4 py-2 font-display text-xs
			text-signal transition hover:bg-signal/10 disabled:opacity-40"
	>
		Reject {selectedCount || ''}
	</button>
</div>
