<script lang="ts">
	import ItemGroup from './ItemGroup.svelte';
	import { bodyField, dataFrom, dataSelectField, titleField } from './editorFields';
	import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

	let { items }: { items: KbBrainItem[] } = $props();

	const ruleKinds = ['validation', 'inference', 'policy'];
	const rules = $derived(items.filter((item) => item.itemKind === 'rule'));
</script>

<div class="mx-auto w-full max-w-2xl">
	<ItemGroup
		heading="Rules & constraints"
		emptyHint="No rules yet — capture what must hold, what follows, and what policy applies."
		itemKind="rule"
		fields={[
			titleField('Rule', 'Every invoice references a signed contract'),
			dataSelectField('ruleKind', 'Kind', ruleKinds),
			bodyField('Detail', 'When does it apply, and what happens when it fails?')
		]}
		submitLabel="Add rule"
		items={rules}
		detailFor={(item) => dataFrom(item, 'ruleKind')}
	/>
</div>
