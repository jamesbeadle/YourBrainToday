<script lang="ts">
	import BrandWordmark from '../site/BrandWordmark.svelte';
</script>

<section class="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2">
	<div class="flex flex-col gap-6">
		<p class="font-display text-sm tracking-widest text-signal uppercase">
			Welcome to Your Brain Today
		</p>
		<h1 class="font-display text-4xl leading-tight font-medium md:text-6xl">
			Consultants who<br />know your business.
		</h1>
		<p class="max-w-prose text-lg text-chalk/70">
			We automate businesses. It starts with learning how yours really runs — the rules of your
			trade, the jobs you have done, the way work moves from enquiry to invoice — and ends with
			the repetitive parts running themselves. Everything we learn is kept in a knowledge base
			that stays yours.
		</p>
		<div class="flex flex-wrap items-center gap-4">
			<a
				href="/contact"
				class="rounded-full bg-signal px-7 py-3 font-display text-sm font-medium text-night
					transition hover:brightness-110"
			>
				Talk to us
			</a>
			<a
				href="/knowledge-base"
				class="rounded-full border border-hairline px-7 py-3 font-display text-sm text-chalk/80
					transition hover:border-chalk/40 hover:text-chalk"
			>
				Build your knowledge base
			</a>
		</div>
	</div>
	<div class="hidden items-center justify-center md:flex" aria-hidden="true">
		<BrandWordmark fontSize={150} />
	</div>
</section>
