<script lang="ts">
	import InvitationsPanel from '$lib/components/workspace/InvitationsPanel.svelte';
	import NewKnowledgeBaseForm from '$lib/components/knowledge/NewKnowledgeBaseForm.svelte';
	import SecondBrainRegister from '$lib/components/knowledge/SecondBrainRegister.svelte';
	import YourChatbotsSection from '$lib/components/chatbots/YourChatbotsSection.svelte';
	import SharedWithYouSection from '$lib/components/knowledge/SharedWithYouSection.svelte';
	import { page } from '$app/state';
	import { newKnowledgeBaseHash } from '$lib/data/knowledge/knowledgeBaseRoutes';

	let { data } = $props();

	let isCreateFormOpen = $state(false);

	$effect(() => {
		if (page.url.hash === newKnowledgeBaseHash) isCreateFormOpen = true;
	});
</script>

<svelte:head>
	<title>Knowledge Base — Your Brain Today</title>
</svelte:head>

<div class="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
	<header class="flex flex-wrap items-end justify-between gap-4">
		<div class="flex flex-col gap-2">
			<p class="font-mono text-sm tracking-widest text-signal uppercase">Knowledge Base</p>
			<h1 class="font-display text-3xl font-medium">Your second brains</h1>
			<p class="max-w-prose text-chalk/70">
				A knowledge base holds a business's second brains — expertise for what it knows,
				experience for what it's done, process for how it works. Open one to feed it, query
				it, and put it to work.
			</p>
		</div>
		<button
			type="button"
			onclick={() => (isCreateFormOpen = !isCreateFormOpen)}
			class="rounded-full bg-signal px-6 py-3 font-display text-sm font-medium text-night
				transition hover:brightness-110"
		>
			{isCreateFormOpen ? 'Close' : 'New knowledge base'}
		</button>
	</header>
	{#if isCreateFormOpen}
		<section class="flex flex-col gap-4 rounded-2xl border border-hairline bg-carriage p-5">
			<h2 class="font-display text-lg font-medium">New knowledge base</h2>
			<NewKnowledgeBaseForm />
		</section>
	{/if}
	{#if data.invitations.length > 0}
		<InvitationsPanel invitations={data.invitations} />
	{/if}
	{#if data.register.length === 0 && data.memberChatbots.length > 0}
		<YourChatbotsSection chatbots={data.memberChatbots} />
	{/if}
	{#if data.register.length === 0}
		<div
			class="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-hairline
				p-12 text-center"
		>
			<p class="max-w-prose text-chalk/60">
				Create your first knowledge base, then grow its second brains — expertise for what you
				know, experience for what you've done, process for how you work.
			</p>
			<button
				type="button"
				onclick={() => (isCreateFormOpen = true)}
				class="rounded-full border border-signal px-6 py-2.5 font-display text-sm text-signal
					transition hover:bg-signal hover:text-night"
			>
				Create a knowledge base
			</button>
		</div>
	{:else}
		<SecondBrainRegister groups={data.register} />
	{/if}
	{#if data.register.length > 0 && data.memberChatbots.length > 0}
		<YourChatbotsSection chatbots={data.memberChatbots} />
	{/if}
	{#if data.sharedBrains.length > 0 || data.sharedWorkflows.length > 0}
		<SharedWithYouSection sharedBrains={data.sharedBrains} sharedWorkflows={data.sharedWorkflows} />
	{/if}
</div>
