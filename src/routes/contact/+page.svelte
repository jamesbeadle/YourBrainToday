<script lang="ts">
	import { companyDetails } from '$lib/data/companyDetails';
</script>

<svelte:head>
	<title>Contact — Your Brain Today</title>
	<meta
		name="description"
		content="Get in touch with Your Brain Today about a knowledge base, a chatbot for your staff, or connecting your own tools."
	/>
</svelte:head>

<article class="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
	<p class="font-mono text-sm tracking-widest text-signal uppercase">Contact</p>
	<h1 class="font-display text-4xl leading-tight font-medium">Talk to us.</h1>
	<p class="text-lg text-chalk/80">
		Whether you want a knowledge base built for your business, a chatbot your staff can ask, or
		your own tools connected to what you know — write to us and a person will reply.
	</p>
	<a
		href={`mailto:${companyDetails.consultingEmail}`}
		class="self-start rounded-full bg-signal px-7 py-3 font-display text-sm font-medium text-night
			transition hover:brightness-110"
	>
		{companyDetails.consultingEmail}
	</a>
	<p class="text-sm text-chalk/60">
		Already have an account? Everything you build lives at
		<a href="/knowledge-base" class="text-chalk underline underline-offset-4 hover:text-signal">
			your knowledge base
		</a>.
	</p>
</article>
