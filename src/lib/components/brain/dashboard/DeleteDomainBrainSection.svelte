<script lang="ts">
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';

	let { brainName, actionBasePath = '' }: { brainName: string; actionBasePath?: string } =
		$props();

	let isDeleteModalOpen = $state(false);
</script>

<section class="flex flex-col gap-2 border-t border-hairline pt-6">
	<h3 class="font-display text-sm text-signal">Delete this expertise brain</h3>
	<p class="text-xs leading-relaxed text-chalk/60">
		Everything it has learned goes with it — every page, bounded context, source document,
		conversation, and log entry. Starting again means feeding it documents from scratch.
	</p>
	<button
		type="button"
		onclick={() => (isDeleteModalOpen = true)}
		class="self-start rounded-full border border-signal/60 px-4 py-2 font-display text-sm
			text-signal transition hover:bg-signal hover:text-night"
	>
		Delete expertise brain
	</button>
</section>

<DangerConfirmModal
	title="Delete this expertise brain?"
	description={`${brainName} and everything it has learned — every page, context, source
		document, and conversation — is deleted with it. This cannot be undone.`}
	action={`${actionBasePath}?/deleteDomainBrain`}
	fields={{}}
	submitLabel="Delete expertise brain"
	confirmWord="DELETE"
	bind:isOpen={isDeleteModalOpen}
/>
