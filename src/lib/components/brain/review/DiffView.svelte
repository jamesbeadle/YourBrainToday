<script lang="ts">
	import { lineDiff } from './lineDiff';

	let { beforeText, afterText }: { beforeText: string; afterText: string } = $props();

	const lines = $derived(lineDiff(beforeText, afterText));

	const lineStyles = {
		same: 'text-chalk/45',
		added: 'bg-go/10 text-go',
		removed: 'bg-signal/10 text-signal/80 line-through decoration-signal/30'
	};

	const lineMarks = { same: ' ', added: '+', removed: '-' };
</script>

<div
	class="max-h-72 overflow-y-auto rounded-lg border border-hairline bg-night font-mono
		text-[11px] leading-relaxed"
>
	{#each lines as line, index (index)}
		<p class={`flex gap-2 px-2 whitespace-pre-wrap ${lineStyles[line.kind]}`}>
			<span class="select-none">{lineMarks[line.kind]}</span>
			<span class="min-w-0 flex-1">{line.text}</span>
		</p>
	{/each}
</div>
