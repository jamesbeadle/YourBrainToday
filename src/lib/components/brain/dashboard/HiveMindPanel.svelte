<script lang="ts">
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { HiveBrainStatus } from '$lib/data/hiveTypes';

	let { hive }: { hive: HiveBrainStatus } = $props();

	const tracker = new FormTracker();
	const isPending = $derived(hive.application?.status === 'pending');
	const isRejected = $derived(hive.application?.status === 'rejected');
	const applyLabel = $derived(hive.membership === null ? 'Apply to join' : 'Refresh my snapshot');
</script>

<div class="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto p-4">
	<section class="flex flex-col gap-2">
		<h3 class="font-display text-sm text-chalk">Trade Talk</h3>
		<p class="text-xs leading-relaxed text-chalk/60">
			Approved knowledge bases join <a href="/trade-talk" class="text-signal underline">Trade Talk</a> as
			frozen snapshots that anyone can consult for credits — and every answer your pages shape
			pays credits straight onto your balance.
		</p>
	</section>
	{#if hive.membership !== null}
		<section class="flex flex-col gap-2 rounded-2xl border border-go/60 bg-carriage p-4">
			<p class="font-display text-xs text-go">In Trade Talk</p>
			<p class="text-sm text-chalk/80">
				Consulted {hive.membership.questionCount}
				{hive.membership.questionCount === 1 ? 'time' : 'times'} · {hive.membership.creditsEarned}
				credits earned
			</p>
			<p class="text-xs text-chalk/50">
				Snapshot taken {new Date(hive.membership.approvedAt).toLocaleDateString('en-GB')}
			</p>
		</section>
	{/if}
	{#if isPending}
		<section class="flex flex-col gap-2 rounded-2xl border border-caution/60 bg-carriage p-4">
			<p class="font-display text-xs text-caution">Application under review</p>
			<p class="text-sm text-chalk/70">{hive.application?.pitch}</p>
		</section>
	{:else}
		{#if isRejected}
			<section class="flex flex-col gap-2 rounded-2xl border border-hairline bg-carriage p-4">
				<p class="font-display text-xs text-chalk/60">Last application was not approved</p>
				{#if hive.application !== null && hive.application.decisionNote !== ''}
					<p class="text-sm text-chalk/70">{hive.application.decisionNote}</p>
				{/if}
			</section>
		{/if}
		<section class="flex flex-col gap-2">
			<h3 class="font-display text-sm text-chalk">{applyLabel}</h3>
			<p class="text-xs leading-relaxed text-chalk/60">
				Say what your specialty can advise on — this is the pitch shown beside your name in the
				hive. Approval takes a fresh snapshot of your model.
			</p>
			<FormErrorNote message={tracker.errorMessage} />
			<form
				method="POST"
				action="?/applyToHiveMind"
				use:enhance={tracker.submit()}
				class="flex flex-col gap-2"
			>
				<textarea
					name="pitch"
					required
					rows="4"
					placeholder="e.g. “Twenty years of marine diesel servicing — ask us anything about keeping old engines running.”"
					aria-label="Trade Talk pitch"
					class="min-w-0 resize-none rounded-2xl border border-hairline bg-carriage px-4 py-2.5
						text-sm text-chalk outline-none placeholder:text-chalk/40 focus:border-signal"
					>{hive.application?.pitch ?? ''}</textarea
				>
				<SubmitButton
					isSaving={tracker.isSaving}
					savingLabel="Submitting…"
					class="self-end rounded-full bg-signal px-5 py-2 font-display text-sm font-medium
						text-night transition hover:brightness-110"
				>
					Submit for review
				</SubmitButton>
			</form>
		</section>
	{/if}
</div>
