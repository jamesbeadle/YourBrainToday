<script lang="ts">
	import { knowledgeKinds } from '$lib/data/knowledge/knowledgeKinds';
</script>

<section class="mx-auto max-w-6xl px-6 py-16">
	<div class="grid items-center gap-10 md:grid-cols-2">
		<div class="flex flex-col gap-4">
			<p class="font-display text-sm tracking-widest text-signal uppercase">How it's built</p>
			<h2 class="font-display text-3xl font-medium">Talk about your business. That's it.</h2>
			<p class="max-w-prose text-chalk/70">
				No forms, no setup wizard, no data entry. You talk about your business — in an
				interview, or by uploading the documents you already have — and YBT works out what
				each thing it learns actually is: a rule of your trade, a thing that happened, a step
				in how work moves. Then it files it in the right brain.
			</p>
			<p class="max-w-prose text-chalk/70">
				The interviewer knows what a complete picture of a business looks like, so it knows
				what's missing from yours — and asks about exactly that. Every answer makes the next
				question sharper.
			</p>
			<a
				href="/knowledge-base"
				class="self-start rounded-full border border-signal/60 px-6 py-2.5 font-display text-sm
					text-signal transition hover:bg-signal hover:text-night"
			>
				Start your knowledge base
			</a>
		</div>
		<div class="flex flex-col gap-3 rounded-2xl border border-hairline bg-carriage p-8">
			<p class="font-display text-sm tracking-widest text-chalk/50 uppercase">
				One answer, filed three ways
			</p>
			<p class="rounded-xl border border-hairline bg-night p-4 text-sm text-chalk/80 italic">
				“Every variation order has to be signed off by the client before we order materials —
				we got burned on the Hartley job when one went ahead without it.”
			</p>
			<ul class="flex flex-col gap-3">
				{#each knowledgeKinds as kind (kind.kind)}
					<li class="flex items-start gap-3 text-sm text-chalk/80">
						<span
							class="mt-1 h-2 w-2 shrink-0 rounded-full"
							style={`background-color: ${kind.accent}`}
						></span>
						<span>
							{#if kind.kind === 'expertise'}
								<span style={`color: ${kind.accent}`}>Expertise:</span> variation orders need
								client sign-off before materials are ordered.
							{:else if kind.kind === 'experience'}
								<span style={`color: ${kind.accent}`}>Experience:</span> the Hartley job — an
								order went ahead unsigned, and it cost.
							{:else}
								<span style={`color: ${kind.accent}`}>Process:</span> sign-off sits between
								variation order and ordering materials.
							{/if}
						</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>
