<script lang="ts">
	import HiveReviewRow from './HiveReviewRow.svelte';
	import type { HiveReviewApplication } from '$lib/server/hive/hiveReview';

	let { applications }: { applications: HiveReviewApplication[] } = $props();
</script>

<section class="flex flex-col gap-4">
	<div class="flex items-baseline justify-between gap-3">
		<h2 class="font-display text-xl font-medium">Trade Talk applications</h2>
		<a
			href="/trade-talk"
			class="font-display text-xs text-chalk/50 underline transition hover:text-chalk"
		>
			View Trade Talk
		</a>
	</div>
	{#if applications.length === 0}
		<p class="rounded-2xl border border-hairline px-5 py-4 text-sm text-chalk/60">
			No applications waiting for review.
		</p>
	{:else}
		<ul class="flex flex-col divide-y divide-hairline rounded-2xl border border-hairline">
			{#each applications as application (application.applicationId)}
				<HiveReviewRow {application} />
			{/each}
		</ul>
	{/if}
</section>
