<script lang="ts">
	import HiveBrainContextSection from '$lib/components/admin/HiveBrainContextSection.svelte';
	import HiveBrainPageCard from '$lib/components/admin/HiveBrainPageCard.svelte';
	import HiveDecisionForms from '$lib/components/admin/HiveDecisionForms.svelte';

	let { data } = $props();

	const appliedDate = $derived(new Date(data.application.createdAt).toLocaleDateString('en-GB'));
	const strayPages = $derived(
		data.pages.filter(
			(page) => !data.contexts.some((context) => context.slug === page.contextSlug)
		)
	);
</script>

<svelte:head>
	<title>{data.application.brainName} — Trade Talk review — Your Brain Today</title>
</svelte:head>

<div class="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-16">
	<div class="flex flex-col gap-2">
		<a href="/admin" class="font-display text-xs text-chalk/50 transition hover:text-chalk">
			← Admin
		</a>
		<h1 class="font-display text-3xl font-medium">{data.application.brainName}</h1>
		<p class="text-sm text-chalk/50">
			{data.application.ownerEmail} · applied {appliedDate}
		</p>
		<p class="max-w-prose text-chalk/70">{data.application.pitch}</p>
	</div>
	<section class="flex flex-col gap-3 rounded-2xl border border-hairline p-5">
		<p class="text-sm text-chalk/60">
			Below is the brain exactly as approval would freeze it into the Trade Talk snapshot — it is
			visible only to admins.
		</p>
		<HiveDecisionForms applicationId={data.application.applicationId} />
	</section>
	{#if data.pages.length === 0 && data.contexts.length === 0}
		<p class="rounded-2xl border border-dashed border-hairline p-6 text-center text-sm text-chalk/50">
			This brain is empty — there is nothing to snapshot yet.
		</p>
	{/if}
	{#each data.contexts as context (context.slug)}
		<HiveBrainContextSection
			{context}
			pages={data.pages.filter((page) => page.contextSlug === context.slug)}
		/>
	{/each}
	{#if strayPages.length > 0}
		<section class="flex flex-col gap-3">
			<h2 class="font-display text-xl font-medium">Model-level pages</h2>
			<ul class="flex flex-col gap-3">
				{#each strayPages as page (page.slug)}
					<HiveBrainPageCard {page} />
				{/each}
			</ul>
		</section>
	{/if}
</div>
