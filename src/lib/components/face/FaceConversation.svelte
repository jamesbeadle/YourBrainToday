<script lang="ts">
	import { requestSpokenReply } from './faceChatClient';
	import type { FaceChatTurn, FaceExpressionName } from '$lib/data/faceChatTypes';

	let {
		onListening,
		onThinking,
		onSpoken,
		onRested
	}: {
		onListening: () => void;
		onThinking: () => void;
		onSpoken: (reply: string, expression: FaceExpressionName) => void;
		onRested: () => void;
	} = $props();

	let turns = $state<FaceChatTurn[]>([]);
	let draft = $state('');
	let caption = $state('Ask me anything about your business.');
	let isThinking = $state(false);

	async function submitQuestion(event: SubmitEvent) {
		event.preventDefault();
		const question = draft.trim();
		if (question === '' || isThinking) return;
		draft = '';
		turns = [...turns, { speaker: 'user', text: question }];
		isThinking = true;
		onThinking();
		const outcome = await requestSpokenReply(turns);
		isThinking = false;
		if (outcome.kind === 'refusal') {
			caption = outcome.message;
			onRested();
			return;
		}
		turns = [...turns, { speaker: 'face', text: outcome.reply }];
		caption = outcome.reply;
		onSpoken(outcome.reply, outcome.expression);
	}

	function noteListening() {
		if (!isThinking) onListening();
	}

	function noteResting() {
		if (!isThinking && draft.trim() === '') onRested();
	}
</script>

<div class="pointer-events-auto flex w-full max-w-xl flex-col items-center gap-3">
	{#if isThinking}
		<div class="flex items-center gap-1.5 py-1" aria-label="The face is thinking">
			<span class="bg-slate/60 h-1.5 w-1.5 animate-bounce rounded-full"></span>
			<span class="bg-slate/60 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:150ms]"
			></span>
			<span class="bg-slate/60 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:300ms]"
			></span>
		</div>
	{:else}
		<p class="text-slate/85 max-h-24 overflow-y-auto text-center text-sm leading-relaxed">
			{caption}
		</p>
	{/if}
	<form onsubmit={submitQuestion} class="flex w-full items-center gap-2">
		<input
			bind:value={draft}
			onfocus={noteListening}
			oninput={noteListening}
			onblur={noteResting}
			placeholder="Ask your expertise brain…"
			aria-label="Your message to the face"
			class="border-etch bg-platform/75 text-slate placeholder:text-slate/45 focus:border-slate/45
				w-full rounded-full border px-4 py-2 text-sm backdrop-blur outline-none"
		/>
		<button
			type="submit"
			disabled={isThinking}
			class="border-slate/40 text-slate hover:bg-slate/10 rounded-full border px-5 py-2
				font-display text-sm transition disabled:opacity-50"
		>
			Ask
		</button>
	</form>
</div>
