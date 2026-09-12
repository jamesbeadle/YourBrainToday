<script lang="ts">
	import ModelUsageTable from '$lib/components/admin/usage/ModelUsageTable.svelte';
	import UsageTotalsPanel from '$lib/components/admin/usage/UsageTotalsPanel.svelte';
	import UsageWindowSwitch from '$lib/components/admin/usage/UsageWindowSwitch.svelte';
	import UserUsageTable from '$lib/components/admin/usage/UserUsageTable.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Usage and margin — Your Brain Today</title>
</svelte:head>

<div class="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16">
	<div class="flex flex-col gap-2">
		<a href="/admin" class="font-display text-xs text-chalk/50 underline transition hover:text-chalk">
			Back to admin
		</a>
		<h1 class="font-display text-3xl font-medium">Usage and margin</h1>
		<p class="text-chalk/70">
			What Claude cost against what the credits it burned were sold for — per user and per
			model — with any settlement that failed to take what it should have.
		</p>
	</div>
	<UsageWindowSwitch windowDays={data.report.windowDays} />
	<UsageTotalsPanel totals={data.report.totals} />
	<section class="flex flex-col gap-4">
		<h2 class="font-display text-xl font-medium">By model</h2>
		<ModelUsageTable models={data.report.models} />
	</section>
	<section class="flex flex-col gap-4">
		<h2 class="font-display text-xl font-medium">By user</h2>
		<UserUsageTable users={data.report.users} />
	</section>
</div>
