<script lang="ts">
	import CopyButton from '$lib/components/site/CopyButton.svelte';
	import { agentBriefingFor, curlExampleFor } from './apiBriefing';

	let { brainUrl, knowledgeBaseUrl }: { brainUrl: string; knowledgeBaseUrl: string } = $props();

	const agentBriefing = $derived(agentBriefingFor(brainUrl, knowledgeBaseUrl));
	const curlExample = $derived(curlExampleFor(knowledgeBaseUrl));

	const codeBlockClasses = `overflow-x-auto rounded-xl border border-hairline bg-chalk/5 p-3 font-mono
		text-xs leading-relaxed text-chalk/80`;
</script>

<div class="flex flex-col gap-2">
	<div class="flex items-center justify-between">
		<h3 class="font-mono text-xs tracking-widest text-chalk/50 uppercase">
			Give this to your agent
		</h3>
		<CopyButton text={agentBriefing} />
	</div>
	<p class="text-xs text-chalk/50">
		Paste this into Claude (or any agent) along with a token and it knows how to use the
		knowledge base — read its four brains, pull pages, or ask it grounded questions.
	</p>
	<pre class={codeBlockClasses}>{agentBriefing}</pre>
</div>

<div class="flex flex-col gap-2">
	<h3 class="font-mono text-xs tracking-widest text-chalk/50 uppercase">Quick test</h3>
	<pre class={codeBlockClasses}>{curlExample}</pre>
</div>
