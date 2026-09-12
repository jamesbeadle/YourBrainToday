<script lang="ts">
	import ServiceCard from './ServiceCard.svelte';
	import { knowledgeServices } from '$lib/data/knowledgeServices';
</script>

<section class="border-y border-hairline bg-carriage/60">
	<div class="mx-auto max-w-6xl px-6 py-16">
		<div class="flex flex-col gap-2">
			<p class="font-display text-sm tracking-widest text-signal uppercase">Use tools</p>
			<h2 class="font-display text-3xl font-medium">Tools that run on your knowledge</h2>
			<p class="max-w-prose text-chalk/70">
				Build the knowledge base once, then put it to work. Each tool draws on what you know and
				gets sharper as your knowledge grows.
			</p>
		</div>
		<div class="mt-10 grid gap-6 md:grid-cols-2">
			{#each knowledgeServices as service (service.id)}
				<ServiceCard {service} />
			{/each}
		</div>
	</div>
</section>
