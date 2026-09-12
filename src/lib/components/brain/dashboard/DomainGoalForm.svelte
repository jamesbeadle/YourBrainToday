<script lang="ts">
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';

	let { domainGoal, actionBasePath = '' }: { domainGoal: string; actionBasePath?: string } =
		$props();

	const tracker = new FormTracker();
</script>

<section class="flex flex-col gap-2">
	<h3 class="font-display text-sm text-chalk">Domain goal</h3>
	<p class="text-xs leading-relaxed text-chalk/60">
		What this brain should articulate. The Modeller measures every page against it, so a
		sharper goal changes how every future document is distilled.
	</p>
	<FormErrorNote message={tracker.errorMessage} />
	<form
		method="POST"
		action={`${actionBasePath}?/updateDomainGoal`}
		use:enhance={tracker.submit()}
		class="flex flex-col gap-2"
	>
		<textarea
			name="domainGoal"
			required
			rows="5"
			placeholder="e.g. “The abstract domain of organized football — the concepts any football app would need, whatever club or league the documents describe.”"
			aria-label="Domain goal"
			class="min-w-0 resize-none rounded-2xl border border-hairline bg-carriage px-4 py-2.5
				text-sm text-chalk outline-none placeholder:text-chalk/40 focus:border-signal"
			>{domainGoal}</textarea
		>
		<SubmitButton
			isSaving={tracker.isSaving}
			savingLabel="Saving…"
			class="self-end rounded-full bg-signal px-5 py-2 font-display text-sm font-medium
				text-night transition hover:brightness-110"
		>
			Save goal
		</SubmitButton>
	</form>
</section>
