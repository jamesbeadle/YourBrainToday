<script lang="ts">
	import HiveDecisionForms from './HiveDecisionForms.svelte';
	import type { HiveReviewApplication } from '$lib/server/hive/hiveReview';

	let { application }: { application: HiveReviewApplication } = $props();

	const appliedDate = $derived(new Date(application.createdAt).toLocaleDateString('en-GB'));
	const reviewPath = $derived(`/admin/hive/${application.applicationId}`);
</script>

<li class="flex flex-col gap-3 p-5">
	<div class="flex flex-wrap items-baseline justify-between gap-2">
		<h3 class="font-display text-lg font-medium">
			<a href={reviewPath} class="underline-offset-4 transition hover:underline">
				{application.brainName}
			</a>
		</h3>
		<p class="font-display text-xs text-chalk/50">
			{application.ownerEmail} · applied {appliedDate}
		</p>
	</div>
	<p class="text-sm text-chalk/70">{application.pitch}</p>
	<div class="flex flex-wrap items-baseline justify-between gap-2">
		<p class="font-display text-xs text-chalk/50">
			{application.contextCount}
			{application.contextCount === 1 ? 'context' : 'contexts'} · {application.pageCount}
			{application.pageCount === 1 ? 'page' : 'pages'}
		</p>
		<a href={reviewPath} class="font-display text-xs text-signal underline-offset-4 transition hover:underline">
			Read the brain →
		</a>
	</div>
	<HiveDecisionForms applicationId={application.applicationId} />
</li>
