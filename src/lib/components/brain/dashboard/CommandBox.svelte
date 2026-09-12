<script lang="ts">
	import { commandBox } from './commandBox';

	let {
		text = $bindable(),
		onSend
	}: {
		text: string;
		onSend: () => void;
	} = $props();

	function sendOnEnter(event: KeyboardEvent): void {
		if (event.key !== 'Enter' || event.shiftKey) return;
		event.preventDefault();
		onSend();
	}
</script>

<form
	onsubmit={(event) => {
		event.preventDefault();
		onSend();
	}}
	class="flex items-start gap-2 border-t border-hairline px-4 py-3"
>
	<span class="text-signal select-none">❯</span>
	<textarea
		bind:value={text}
		use:commandBox={text}
		onkeydown={sendOnEnter}
		rows="1"
		placeholder="query your brain…"
		class="w-full resize-y bg-transparent text-chalk placeholder-chalk/30 outline-none"
	></textarea>
</form>
