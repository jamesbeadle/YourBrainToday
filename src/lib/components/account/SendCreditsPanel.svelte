<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	let email = $state('');
	let amountText = $state('');
	let isSending = $state(false);
	let notice = $state<{ tone: 'go' | 'caution'; message: string } | null>(null);

	async function send(event: SubmitEvent) {
		event.preventDefault();
		if (isSending) return;
		isSending = true;
		notice = null;
		const response = await fetch('/api/credits/send', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ email, amount: Number(amountText) })
		});
		isSending = false;
		if (!response.ok) return (notice = { tone: 'caution', message: await messageFrom(response) });
		const payload = await response.json();
		notice = { tone: 'go', message: `Sent ${amountText} credits to ${payload.recipientEmail}.` };
		email = '';
		amountText = '';
		await invalidateAll();
	}

	async function messageFrom(response: Response): Promise<string> {
		const payload = await response.json().catch(() => null);
		return payload?.message ?? 'Sending went wrong — nothing was taken.';
	}
</script>

<section class="flex flex-col gap-4 rounded-2xl border border-hairline bg-carriage p-6">
	<div>
		<h2 class="font-display text-xl font-medium">Send credits</h2>
		<p class="text-sm text-chalk/60">
			Move credits to another Your Brain Today account by email. If no account has that
			email, nothing is taken.
		</p>
	</div>
	<form onsubmit={send} class="flex flex-wrap items-center gap-3">
		<input
			bind:value={email}
			type="email"
			required
			placeholder="teammate@company.co.uk"
			class="min-w-52 flex-1 rounded-xl border border-hairline bg-night px-3 py-2 text-sm
				text-chalk placeholder-chalk/30 outline-none focus:border-chalk/40"
		/>
		<input
			bind:value={amountText}
			type="number"
			required
			min="1"
			max="100000"
			placeholder="250"
			class="w-28 rounded-xl border border-hairline bg-night px-3 py-2 text-sm text-chalk
				placeholder-chalk/30 outline-none focus:border-chalk/40"
		/>
		<button
			type="submit"
			disabled={isSending}
			class="rounded-full bg-signal px-6 py-2 font-display text-sm font-medium text-night
				transition hover:brightness-110 disabled:opacity-40"
		>
			{isSending ? 'Sending…' : 'Send'}
		</button>
	</form>
	{#if notice !== null}
		<p class={`text-sm ${notice.tone === 'go' ? 'text-go' : 'text-caution'}`}>
			{notice.message}
		</p>
	{/if}
</section>
