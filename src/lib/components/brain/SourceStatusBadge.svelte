<script lang="ts">
	import { readingStageLabels } from '$lib/data/sourceReading';
	import type { BrainSource } from '$lib/data/brainTypes';

	let { source }: { source: BrainSource } = $props();

	const statusStyles: Record<BrainSource['status'], string> = {
		uploaded: 'border-chalk/30 text-chalk/60',
		reading: 'border-caution/60 text-caution animate-pulse',
		ingested: 'border-go/60 text-go',
		failed: 'border-signal/60 text-signal',
		proposed: 'border-caution/60 text-caution',
		rejected: 'border-signal/60 text-signal'
	};

	const statusLabels: Record<BrainSource['status'], string> = {
		uploaded: 'Waiting',
		reading: 'Reading',
		ingested: 'In the brain',
		failed: 'Failed',
		proposed: 'Awaiting review',
		rejected: 'Rejected'
	};

	const label = $derived(
		source.status === 'reading' && source.stage !== null
			? `Reading — ${readingStageLabels[source.stage]}`
			: statusLabels[source.status]
	);
</script>

<span class={`rounded-full border px-3 py-1 font-display text-xs ${statusStyles[source.status]}`}>
	{label}
</span>
