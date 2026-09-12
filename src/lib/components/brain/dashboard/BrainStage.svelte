<script lang="ts">
	import BrainConstellation from '../BrainConstellation.svelte';
	import BrainDashboardFooter from './BrainDashboardFooter.svelte';
	import OutOfCreditsNotice from '../../workspace/OutOfCreditsNotice.svelte';
	import { fetchBrainPage } from '../constellation/fetchBrainPage';
	import type { BrainContext, BrainPageLink, BrainPageSummary } from '$lib/data/brainTypes';

	let {
		brainId,
		pageBasePath,
		contexts,
		pageIndex,
		pageLinks,
		backHref,
		backLabel,
		isOwner,
		isOutOfCredits
	}: {
		brainId: string;
		pageBasePath: string;
		contexts: BrainContext[];
		pageIndex: BrainPageSummary[];
		pageLinks: BrainPageLink[];
		backHref: string;
		backLabel: string;
		isOwner: boolean;
		isOutOfCredits: boolean;
	} = $props();

	let constellation = $state<{ drillToNeuron: (slug: string) => void }>();

	export function drillToNeuron(slug: string): void {
		constellation?.drillToNeuron(slug);
	}
</script>

<div class="relative min-w-0 flex-1">
	<BrainConstellation
		bind:this={constellation}
		loadPage={(slug) => fetchBrainPage(brainId, slug)}
		{pageBasePath}
		{contexts}
		{pageIndex}
		{pageLinks}
	/>
	<BrainDashboardFooter {brainId} {backHref} {backLabel} {isOwner} />
	{#if isOutOfCredits}
		<div class="absolute inset-x-4 top-4 z-20 overflow-hidden rounded-2xl border border-hairline">
			<OutOfCreditsNotice />
		</div>
	{/if}
</div>
