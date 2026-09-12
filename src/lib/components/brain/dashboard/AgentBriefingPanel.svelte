<script lang="ts">
	import CopyButton from '$lib/components/site/CopyButton.svelte';
	import { agentBriefingFor, curlExampleFor } from './apiBriefing';

	let { baseUrl }: { baseUrl: string } = $props();

	const agentBriefing = $derived(agentBriefingFor(baseUrl));
	const curlExample = $derived(curlExampleFor(baseUrl));

	const codeBlockClasses = `overflow-x-auto rounded-xl border border-hairline bg-chalk/5 p-3 font-mono
		text-xs leading-relaxed text-chalk/80`;
</script>

<div class="flex flex-col gap-2">
	<div class="flex items-center justify-between">
		<h3 class="font-display text-xs tracking-widest text-chalk/50 uppercase">
			Give this to your agent
		</h3>
		<CopyButton text={agentBriefing} />
	</div>
	<p class="text-xs text-chalk/50">
		Paste this into Claude (or any agent) along with a token and it knows how to navigate the
		brain — read the index, pull pages, or ask grounded questions.
	</p>
	<pre class={codeBlockClasses}>{agentBriefing}</pre>
</div>

<div class="flex flex-col gap-2">
	<h3 class="font-display text-xs tracking-widest text-chalk/50 uppercase">Quick test</h3>
	<pre class={codeBlockClasses}>{curlExample}</pre>
</div>
