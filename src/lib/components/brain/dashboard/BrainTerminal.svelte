<script lang="ts">
	import CommandBox from './CommandBox.svelte';
	import TerminalFeed from './TerminalFeed.svelte';
	import { createTerminalAsk } from './terminalAsk';
	import type { BrainConversationMessage, BrainPageSummary } from '$lib/data/brainTypes';

	let {
		brainId,
		conversationId,
		messages,
		pageIndex,
		pageBasePath,
		onOutOfCredits
	}: {
		brainId: string;
		conversationId: string | null;
		messages: BrainConversationMessage[];
		pageIndex: BrainPageSummary[];
		pageBasePath: string;
		onOutOfCredits: () => void;
	} = $props();

	let commandText = $state('');
	let isThinking = $state(false);
	let pendingQuestion = $state<string | null>(null);
	let transferLines = $state<string[]>([]);
	let scrollElement = $state<HTMLDivElement>();

	$effect(() => {
		void (messages.length + transferLines.length + Number(isThinking));
		const element = scrollElement;
		if (element !== undefined) element.scrollTo({ top: element.scrollHeight });
	});

	async function sendCommand() {
		const question = commandText.trim();
		if (question === '' || isThinking) return;
		commandText = '';
		isThinking = true;
		await ask(question, conversationId);
		isThinking = false;
	}

	const appendLine = (line: string) => (transferLines = [...transferLines, line]);

	const ask = $derived(
		createTerminalAsk({
			brainId,
			appendLine,
			onOutOfCredits,
			setPendingQuestion: (question) => (pendingQuestion = question)
		})
	);
</script>

<div role="log" class="relative flex h-full flex-col bg-night font-mono text-[13px] leading-relaxed">
	<div bind:this={scrollElement} class="min-h-0 flex-1 overflow-y-auto px-4 py-3">
		<TerminalFeed
			{messages}
			{pageIndex}
			{pageBasePath}
			{pendingQuestion}
			{isThinking}
			{transferLines}
			activeTransferName={null}
		/>
	</div>
	<CommandBox bind:text={commandText} onSend={sendCommand} />
</div>
