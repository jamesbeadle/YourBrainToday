<script lang="ts">
	import { drivenSources } from './drivenSources.svelte';
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
		uploaded: 'Not read yet',
		reading: 'Reading',
		ingested: 'In the brain',
		failed: 'Failed',
		proposed: 'Awaiting review',
		rejected: 'Rejected'
	};

	const isBeingReadHere = $derived(drivenSources.has(source.id));
	const status = $derived(isBeingReadHere ? 'reading' : source.status);
	const label = $derived(labelFor(source, isBeingReadHere));

	function labelFor(candidate: BrainSource, isReadingHere: boolean): string {
		if (isReadingHere) return statusLabels.reading;
		const stage = candidate.stage;
		const isReading = candidate.status === 'reading';
		if (isReading && stage !== null) return `Reading — ${readingStageLabels[stage]}`;
		return statusLabels[candidate.status];
	}
</script>

<span class={`rounded-full border px-3 py-1 font-display text-xs ${statusStyles[status]}`}>
	{label}
</span>
