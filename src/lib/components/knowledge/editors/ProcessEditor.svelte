<script lang="ts">
	import ItemGroup from './ItemGroup.svelte';
	import { dataField, dataFrom, dataSelectField, titleField } from './editorFields';
	import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

	let { items }: { items: KbBrainItem[] } = $props();

	const stages = $derived(items.filter((item) => item.itemKind === 'stage'));
	const transitions = $derived(items.filter((item) => item.itemKind === 'stage_transition'));
	const stageNames = $derived(stages.map((stage) => stage.title));
</script>

<div class="grid gap-6 lg:grid-cols-2">
	<ItemGroup
		heading="Stages"
		emptyHint="No stages yet — the steps work passes through, in order."
		itemKind="stage"
		fields={[
			titleField('Stage', 'Enquiry, Survey, Quote, Build…'),
			dataField('responsibility', 'Responsible', 'Site manager, QS, client…')
		]}
		submitLabel="Add stage"
		items={stages}
		detailFor={(item) => dataFrom(item, 'responsibility')}
	/>
	<ItemGroup
		heading="Transitions"
		emptyHint="No transitions yet — what moves work from one stage to the next."
		itemKind="stage_transition"
		fields={[
			titleField('What moves it', 'Client signs the quote'),
			...(stageNames.length > 0
				? [
						dataSelectField('fromStage', 'From stage', stageNames),
						dataSelectField('toStage', 'To stage', stageNames)
					]
				: [dataField('fromStage', 'From stage'), dataField('toStage', 'To stage')])
		]}
		submitLabel="Add transition"
		items={transitions}
		detailFor={(item) => `${dataFrom(item, 'fromStage')} → ${dataFrom(item, 'toStage')}`}
	/>
</div>
