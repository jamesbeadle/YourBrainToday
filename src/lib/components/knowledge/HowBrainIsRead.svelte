<script lang="ts">
	import type { BrainCategory } from '$lib/data/knowledge/knowledgeTypes';

	let { category }: { category: BrainCategory } = $props();

	const readings: Record<BrainCategory, string> = {
		domain:
			'An agent sees every page in the index, searches the page bodies by words, and reads the ' +
			'pages that could hold the answer in full.',
		instance:
			'An agent sees the newest entries in full and searches the rest by words, so an old ' +
			'episode is found when a question names it.',
		people:
			'An agent sees the people and relationships in full and searches their notes by words.'
	};
</script>

<p class="text-sm text-chalk/60">{readings[category]}</p>
