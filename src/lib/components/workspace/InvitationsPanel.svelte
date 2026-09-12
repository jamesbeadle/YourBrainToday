<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { ReceivedInvite } from '$lib/data/sharingTypes';

	let { invitations }: { invitations: ReceivedInvite[] } = $props();

	let decidingId = $state<string | null>(null);

	async function answer(invite: ReceivedInvite, decision: 'accept' | 'decline') {
		decidingId = invite.id;
		await fetch('/api/workspace/invites', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ inviteId: invite.id, decision })
		});
		decidingId = null;
		await invalidateAll();
	}

	function describe(invite: ReceivedInvite): string {
		const scopeLabel = invite.scope === 'entity' ? 'everything in' : 'the expertise brain';
		return `invited you to collaborate on ${scopeLabel} “${invite.targetName}”`;
	}
</script>

<section class="flex flex-col gap-3">
	<h2 class="font-display text-xs tracking-widest text-chalk/50 uppercase">Invitations</h2>
	<ul class="flex flex-col gap-3">
		{#each invitations as invite (invite.id)}
			<li
				class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border
					border-go/30 bg-carriage p-5"
			>
				<p class="min-w-0 text-sm text-chalk/80">
					<strong class="text-chalk">{invite.invitedByEmail}</strong>
					{describe(invite)}
				</p>
				<div class="flex shrink-0 gap-2">
					<button
						type="button"
						disabled={decidingId === invite.id}
						onclick={() => answer(invite, 'accept')}
						class="rounded-full bg-go px-5 py-1.5 font-display text-xs font-medium text-night
							transition hover:brightness-110 disabled:opacity-40"
					>
						Accept
					</button>
					<button
						type="button"
						disabled={decidingId === invite.id}
						onclick={() => answer(invite, 'decline')}
						class="rounded-full border border-hairline px-5 py-1.5 font-display text-xs
							text-chalk/70 transition hover:border-signal/60 hover:text-signal
							disabled:opacity-40"
					>
						Decline
					</button>
				</div>
			</li>
		{/each}
	</ul>
</section>
