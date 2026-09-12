<script lang="ts">
	import HiveAskPanel from '$lib/components/hive/HiveAskPanel.svelte';
	import HiveConstellation from '$lib/components/hive/HiveConstellation.svelte';
	import HiveHeroSection from '$lib/components/hive/HiveHeroSection.svelte';
	import HiveJoinSection from '$lib/components/hive/HiveJoinSection.svelte';
	import HiveRecentQuestions from '$lib/components/hive/HiveRecentQuestions.svelte';
	import HiveRosterSection from '$lib/components/hive/HiveRosterSection.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Trade Talk — Your Brain Today</title>
	<meta
		name="description"
		content="Trade Talk: ask one question and consult the second brains of every approved trade at once — direct answers from real businesses, with the trades paid a revenue share for what their knowledge contributes."
	/>
</svelte:head>

<HiveHeroSection memberCount={data.members.length} />
<section class="mx-auto max-w-6xl px-6 pb-16">
	<div class="overflow-hidden rounded-2xl border border-hairline">
		<HiveConstellation members={data.members} />
	</div>
</section>
<HiveAskPanel isSignedIn={data.isSignedIn} hasSpecialists={data.members.length > 0} />
{#if data.recentQuestions.length > 0}
	<HiveRecentQuestions questions={data.recentQuestions} />
{/if}
<HiveRosterSection members={data.members} />
<HiveJoinSection />
