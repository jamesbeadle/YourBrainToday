<script lang="ts">
	let { intro, onStart }: { intro: string; onStart: () => void } = $props();
</script>

<div class="flex flex-col items-start gap-3">
	<p class="text-sm text-chalk/60">{intro}</p>
	<button
		type="button"
		onclick={onStart}
		class="rounded-full bg-signal px-6 py-2.5 font-display text-sm font-medium text-night
			transition hover:brightness-110"
	>
		Start the interview
	</button>
</div>
