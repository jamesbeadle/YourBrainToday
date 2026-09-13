<script lang="ts">
	import OwnedChatbotsSection from '$lib/components/chatbots/OwnedChatbotsSection.svelte';
	import YourChatbotsSection from '$lib/components/chatbots/YourChatbotsSection.svelte';

	let { data } = $props();

	const isOwner = $derived(data.ownedGroups.length > 0);
	const hasNothingToShow = $derived(data.memberChatbots.length === 0 && !isOwner);
</script>

<svelte:head>
	<title>Chatbots — Your Brain Today</title>
</svelte:head>

<div class="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
	<header class="flex flex-col gap-2">
		<p class="font-mono text-sm tracking-widest text-signal uppercase">Chatbots</p>
		<h1 class="font-display text-3xl font-medium">Ask what the business knows</h1>
		<p class="max-w-prose text-chalk/70">
			A chatbot answers from a knowledge base's three brains — expertise, experience and
			process — for the people its owner has invited.
		</p>
	</header>
	{#if hasNothingToShow}
		<div
			class="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-hairline
				p-12 text-center"
		>
			<p class="max-w-prose text-chalk/60">
				Nobody has invited you to a chatbot yet. When someone does, the invite email brings
				you here — or build a knowledge base of your own and start a bot on it.
			</p>
			<a
				href="/knowledge-base"
				class="rounded-full border border-signal px-6 py-2.5 font-display text-sm text-signal
					transition hover:bg-signal hover:text-night"
			>
				Go to your knowledge base
			</a>
		</div>
	{/if}
	{#if data.memberChatbots.length > 0}
		<YourChatbotsSection chatbots={data.memberChatbots} title="Chatbots you can ask" />
	{/if}
	{#if isOwner}
		<OwnedChatbotsSection groups={data.ownedGroups} />
	{/if}
</div>
