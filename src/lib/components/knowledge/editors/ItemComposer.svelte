<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { FieldSpec } from './editorFields';

	let {
		itemKind,
		fields,
		submitLabel,
		hiddenValues = {}
	}: {
		itemKind: string;
		fields: FieldSpec[];
		submitLabel: string;
		hiddenValues?: Record<string, string>;
	} = $props();

	const tracker = new FormTracker();

	const inputClasses = `rounded-xl border border-hairline bg-night px-3 py-2 text-sm text-chalk
		outline-none focus:border-signal`;
</script>

<form
	method="POST"
	action="?/createItem"
	use:enhance={tracker.submit()}
	class="flex flex-col gap-3 rounded-xl border border-hairline bg-night/40 p-4"
>
	<input type="hidden" name="itemKind" value={itemKind} />
	{#each Object.entries(hiddenValues) as [hiddenName, hiddenValue] (hiddenName)}
		<input type="hidden" name={hiddenName} value={hiddenValue} />
	{/each}
	{#each fields as field (field.name)}
		<label class="flex flex-col gap-1">
			<span class="text-xs tracking-widest text-chalk/50 uppercase">{field.label}</span>
			{#if field.control === 'textarea'}
				<textarea
					name={field.name}
					rows="3"
					placeholder={field.placeholder ?? ''}
					required={field.isRequired ?? false}
					class={inputClasses}
				></textarea>
			{:else if field.control === 'select'}
				<select name={field.name} required={field.isRequired ?? false} class={inputClasses}>
					{#each field.options ?? [] as option (option.value)}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			{:else if field.control === 'datetime'}
				<input
					type="datetime-local"
					name={field.name}
					required={field.isRequired ?? false}
					class={inputClasses}
				/>
			{:else if field.control === 'date'}
				<input
					type="date"
					name={field.name}
					required={field.isRequired ?? false}
					class={inputClasses}
				/>
			{:else}
				<input
					type="text"
					name={field.name}
					placeholder={field.placeholder ?? ''}
					required={field.isRequired ?? false}
					class={inputClasses}
				/>
			{/if}
		</label>
	{/each}
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton
		isSaving={tracker.isSaving}
		savingLabel="Adding…"
		class="self-end rounded-full bg-go px-5 py-2 font-display text-sm font-medium text-night
			transition hover:brightness-110"
	>
		{submitLabel}
	</SubmitButton>
</form>
