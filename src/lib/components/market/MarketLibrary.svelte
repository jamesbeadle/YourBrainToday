<script lang="ts">
	import type { BrainSubscription, PurchasedEdition } from '$lib/data/marketTypes';

	let {
		purchasedEditions,
		subscriptions
	}: {
		purchasedEditions: PurchasedEdition[];
		subscriptions: BrainSubscription[];
	} = $props();

	function brainPath(entityId: string, brainId: string): string {
		return `/workspace/${entityId}/domains/${brainId}`;
	}

	function formatDay(isoDate: string): string {
		return new Date(isoDate).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function isLapsed(subscription: BrainSubscription): boolean {
		return new Date(subscription.currentPeriodEnd).getTime() <= Date.now();
	}
</script>

<section class="flex flex-col gap-3">
	<h2 class="font-display text-xs tracking-widest text-chalk/50 uppercase">Your library</h2>
	<ul class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
		{#each purchasedEditions as purchased (purchased.purchaseId)}
			<li>
				<a
					href={brainPath(purchased.entityId, purchased.brainId)}
					class="group flex flex-col gap-1 rounded-2xl border border-hairline bg-carriage p-5
						transition hover:border-chalk/30"
				>
					<span class="font-display text-base text-chalk transition group-hover:text-signal">
						{purchased.headline}
					</span>
					<span class="text-xs text-chalk/50">
						Edition v{purchased.editionVersion} — {purchased.editionName} · yours since
						{formatDay(purchased.purchasedAt)}
					</span>
				</a>
			</li>
		{/each}
		{#each subscriptions as subscription (subscription.purchaseId)}
			<li>
				<a
					href={isLapsed(subscription)
						? `/market/${subscription.listingId}`
						: brainPath(subscription.entityId, subscription.brainId)}
					class="group flex flex-col gap-1 rounded-2xl border border-hairline bg-carriage p-5
						transition hover:border-chalk/30"
				>
					<span class="font-display text-base text-chalk transition group-hover:text-signal">
						{subscription.headline}
					</span>
					{#if isLapsed(subscription)}
						<span class="text-xs text-caution">
							Subscription lapsed {formatDay(subscription.currentPeriodEnd)} — renew from the
							listing
						</span>
					{:else}
						<span class="text-xs text-chalk/50">
							Live subscription ·
							{subscription.status === 'cancelled' ? 'access until' : 'renews by'}
							{formatDay(subscription.currentPeriodEnd)}
						</span>
					{/if}
				</a>
			</li>
		{/each}
	</ul>
</section>
