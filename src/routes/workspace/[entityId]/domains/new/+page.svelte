<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';

	let { data } = $props();

	const tracker = new FormTracker();
</script>

<svelte:head>
	<title>New Expertise Brain — {data.entity.name} — Your Brain Today</title>
</svelte:head>

<div class="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
	<a href="/knowledge-base" class="font-display text-sm text-chalk/60 transition hover:text-chalk">
		← Back to the knowledge base
	</a>
	<header class="flex flex-col gap-2">
		<p class="font-display text-sm tracking-widest text-signal uppercase">New Expertise Brain</p>
		<h1 class="font-display text-3xl font-medium">What should it know?</h1>
		<p class="max-w-prose text-chalk/70">
			Name the domain and state its goal in your own words — the brain reads everything you
			feed it with that goal in mind.
		</p>
	</header>
	<form
		method="POST"
		action="?/createDomainBrain"
		use:enhance={tracker.submit()}
		class="flex flex-col gap-4 rounded-2xl border border-hairline bg-carriage p-5"
	>
		<label class="flex flex-col gap-1">
			<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">Name</span>
			<input
				name="name"
				required
				placeholder="The knowledge of the business"
				class="rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none
					focus:border-signal"
			/>
		</label>
		<label class="flex flex-col gap-1">
			<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">Domain goal</span>
			<textarea
				name="domainGoal"
				rows="3"
				placeholder="Understand how this business quotes, delivers, and gets paid — in its own language."
				class="rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none
					focus:border-signal"
			></textarea>
		</label>
		<FormErrorNote message={tracker.errorMessage} />
		<SubmitButton
			isSaving={tracker.isSaving}
			savingLabel="Creating…"
			class="self-end rounded-full bg-signal px-6 py-2.5 font-display text-sm font-medium
				text-night transition hover:brightness-110"
		>
			Create brain
		</SubmitButton>
	</form>
</div>
