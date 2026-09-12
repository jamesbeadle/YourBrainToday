<script lang="ts">
	import { usageWindowChoices, type UsageWindowDays } from '$lib/data/usageWindow';

	let { windowDays }: { windowDays: UsageWindowDays } = $props();
</script>

<nav class="flex flex-wrap items-center gap-2" aria-label="Reporting window">
	<span class="text-sm text-chalk/60">Last</span>
	{#each usageWindowChoices as choice (choice)}
		<a
			href={`/admin/usage?days=${choice}`}
			aria-current={choice === windowDays ? 'page' : undefined}
			class="rounded-full border px-4 py-1.5 font-display text-sm transition
				{choice === windowDays
				? 'border-go bg-go text-night'
				: 'border-hairline text-chalk/70 hover:border-go hover:text-go'}"
		>
			{choice} days
		</a>
	{/each}
</nav>
