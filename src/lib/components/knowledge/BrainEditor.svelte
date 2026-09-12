<script lang="ts">
	import ChunkStoreEditor from './editors/ChunkStoreEditor.svelte';
	import DddModelPanel from './editors/DddModelPanel.svelte';
	import EventLogEditor from './editors/EventLogEditor.svelte';
	import EventSchemaEditor from './editors/EventSchemaEditor.svelte';
	import GraphVectorEditor from './editors/GraphVectorEditor.svelte';
	import HybridPackEditor from './editors/HybridPackEditor.svelte';
	import JournalEditor from './editors/JournalEditor.svelte';
	import NotesEditor from './editors/NotesEditor.svelte';
	import OutlinerEditor from './editors/OutlinerEditor.svelte';
	import ProcessEditor from './editors/ProcessEditor.svelte';
	import RecordsEditor from './editors/RecordsEditor.svelte';
	import RulesEditor from './editors/RulesEditor.svelte';
	import SchemaEditor from './editors/SchemaEditor.svelte';
	import TaxonomyEditor from './editors/TaxonomyEditor.svelte';
	import TemporalGraphEditor from './editors/TemporalGraphEditor.svelte';
	import type { BoundSchemaType } from '$lib/data/knowledge/boundSchemaTypes';
	import type { BrainEditorKind, KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

	let {
		editor,
		items,
		schemaTypes,
		dddEditorHref
	}: {
		editor: BrainEditorKind;
		items: KbBrainItem[];
		schemaTypes: BoundSchemaType[];
		dddEditorHref: string | null;
	} = $props();
</script>

{#if editor === 'schema'}
	<SchemaEditor {items} />
{:else if editor === 'ddd_link'}
	<DddModelPanel editorHref={dddEditorHref} />
{:else if editor === 'taxonomy'}
	<TaxonomyEditor {items} />
{:else if editor === 'rules'}
	<RulesEditor {items} />
{:else if editor === 'event_schema'}
	<EventSchemaEditor {items} />
{:else if editor === 'process'}
	<ProcessEditor {items} />
{:else if editor === 'hybrid_pack'}
	<HybridPackEditor {items} />
{:else if editor === 'notes'}
	<NotesEditor {items} />
{:else if editor === 'outliner'}
	<OutlinerEditor {items} />
{:else if editor === 'event_log'}
	<EventLogEditor {items} />
{:else if editor === 'temporal_graph'}
	<TemporalGraphEditor {items} />
{:else if editor === 'graph_vector'}
	<GraphVectorEditor {items} />
{:else if editor === 'records'}
	<RecordsEditor {items} {schemaTypes} />
{:else if editor === 'wiki'}
	<NotesEditor
		{items}
		itemKind="wiki_page"
		heading="Wiki pages"
		emptyHint="No pages yet — an agent keeps these current; pages update rather than pile up."
		bodyPlaceholder="Markdown body. Link with [[another page title]]."
	/>
{:else if editor === 'journal'}
	<JournalEditor {items} />
{:else if editor === 'chunk_store'}
	<ChunkStoreEditor {items} />
{/if}
