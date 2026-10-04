<script lang="ts">
	import { inputClasses, quietButtonClasses } from '$lib/components/site/formStyles';
	import { addLinkedSource } from './addLinkedSource';
	import type { SourceUploadQueue } from './sourceUploadQueue.svelte';

	let { brainId, queue }: { brainId: string; queue: SourceUploadQueue } = $props();

	const linkPlaceholder = 'https://github.com/you/your-repo, https://x.com/you, or any web page';
	const readingLinkLine = 'reading the link…';

	let link = $state('');

	const hasLink = $derived(looksLikeLink(link));

	function looksLikeLink(candidate: string): boolean {
		return /^https?:\/\/\S+\.\S+/i.test(candidate.trim());
	}

	function addLink() {
		const linkToRead = link.trim();
		link = '';
		void queue.enqueue(linkToRead, readingLinkLine, (onProgress) =>
			addLinkedSource(linkToRead, brainId, onProgress)
		);
	}

	function addLinkOnEnter(event: KeyboardEvent) {
		if (event.key !== 'Enter' || !hasLink) return;
		event.preventDefault();
		addLink();
	}
</script>

<div class="flex flex-col gap-2">
	<div class="flex gap-2">
		<input
			bind:value={link}
			type="url"
			inputmode="url"
			autocomplete="off"
			aria-label="Link to read"
			placeholder={linkPlaceholder}
			onkeydown={addLinkOnEnter}
			class={`${inputClasses} min-w-0 flex-1 text-sm placeholder:text-chalk/40`}
		/>
		<button
			type="button"
			disabled={!hasLink}
			onclick={addLink}
			class={`${quietButtonClasses} shrink-0 disabled:opacity-40`}
		>
			Add link
		</button>
	</div>
	<p class="text-xs text-chalk/50">
		A GitHub repository is read like a newcomer would — readme, docs, then the code. An X profile
		gives its bio and recent posts. Anything else is read as a page. Credits scale with the text.
	</p>
</div>
