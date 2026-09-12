<script lang="ts">
	import '../app.css';
	import NavigationProgressBar from '$lib/components/site/NavigationProgressBar.svelte';
	import SiteFooter from '$lib/components/site/SiteFooter.svelte';
	import SiteHeader from '$lib/components/site/SiteHeader.svelte';
	import { isKnowledgeBaseDashboardRoute } from '$lib/components/knowledge/dashboard/dashboardRoute';
	import { SlowNavigation } from '$lib/client/slowNavigation.svelte';
	import { page } from '$app/state';

	let { children, data } = $props();

	const slowNavigation = new SlowNavigation();
	const isDashboard = $derived(isKnowledgeBaseDashboardRoute(page.route.id));
</script>

<NavigationProgressBar />

<div class="flex min-h-screen flex-col">
	<SiteHeader
		userEmail={data.userEmail}
		creditBalance={data.creditBalance}
		isAdmin={data.isAdmin}
		knowledgeBases={data.knowledgeBases}
	/>
	<main
		class={[
			'transition-opacity duration-300',
			isDashboard
				? 'h-[calc(100dvh-var(--site-header-height))] flex-none overflow-hidden'
				: 'flex-1',
			slowNavigation.isActive && !isDashboard && 'pointer-events-none opacity-40'
		]}
	>
		{@render children()}
	</main>
	{#if !isDashboard}
		<SiteFooter />
	{/if}
</div>
