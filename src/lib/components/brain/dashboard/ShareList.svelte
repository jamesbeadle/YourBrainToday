<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { mergedInviteGrants, mergedShareGrants, type MergedGrant } from './shareGrouping';
	import type { WorkspaceInvite, WorkspaceShare } from '$lib/data/sharingTypes';

	let {
		shares,
		invites,
		onResend
	}: {
		shares: WorkspaceShare[];
		invites: WorkspaceInvite[];
		onResend: (invite: MergedGrant) => void;
	} = $props();

	const collaborators = $derived(mergedShareGrants(shares));
	const invited = $derived(mergedInviteGrants(invites.filter((invite) => invite.status === 'pending')));
	const declined = $derived(mergedInviteGrants(invites.filter((invite) => invite.status === 'declined')));

	async function revoke(idField: 'shareId' | 'inviteId', grant: MergedGrant) {
		for (const id of grant.ids) {
			await fetch('/api/workspace/shares', {
				method: 'DELETE',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ [idField]: id })
			});
		}
		await invalidateAll();
	}

	function scopeLabel(scope: 'brain' | 'entity'): string {
		return scope === 'entity' ? 'Whole entity' : 'This brain';
	}
</script>

<ul class="flex flex-col">
	{#each collaborators as grant (grant.email)}
		<li class="flex items-center justify-between gap-3 border-b border-hairline py-2.5 last:border-b-0">
			<div class="min-w-0">
				<p class="truncate text-sm text-chalk">{grant.email}</p>
				<p class="font-display text-[10px] tracking-widest text-chalk/40 uppercase">
					{scopeLabel(grant.scope)}
				</p>
			</div>
			<button
				type="button"
				onclick={() => revoke('shareId', grant)}
				aria-label={`Stop sharing with ${grant.email}`}
				class="rounded-full px-1.5 text-chalk/40 transition hover:bg-hairline/40 hover:text-signal"
			>
				✕
			</button>
		</li>
	{/each}
	{#each declined as grant (grant.email)}
		<li class="flex items-center justify-between gap-3 border-b border-hairline py-2.5 last:border-b-0">
			<div class="min-w-0">
				<p class="truncate text-sm text-chalk/50">{grant.email}</p>
				<p class="font-display text-[10px] tracking-widest text-signal/60 uppercase">
					Declined · {scopeLabel(grant.scope)}
				</p>
			</div>
			<button
				type="button"
				onclick={() => revoke('inviteId', grant)}
				aria-label={`Dismiss the declined invite for ${grant.email}`}
				class="rounded-full px-1.5 text-chalk/40 transition hover:bg-hairline/40 hover:text-signal"
			>
				✕
			</button>
		</li>
	{/each}
	{#each invited as grant (grant.email)}
		<li class="flex items-center justify-between gap-3 border-b border-hairline py-2.5 last:border-b-0">
			<div class="min-w-0">
				<p class="truncate text-sm text-chalk/70">{grant.email}</p>
				<p class="font-display text-[10px] tracking-widest text-caution/70 uppercase">
					Invited · {scopeLabel(grant.scope)}
				</p>
			</div>
			<div class="flex shrink-0 items-center gap-2">
				<button
					type="button"
					onclick={() => onResend(grant)}
					class="font-display text-xs text-chalk/60 underline transition hover:text-chalk"
				>
					Resend invite
				</button>
				<button
					type="button"
					onclick={() => revoke('inviteId', grant)}
					aria-label={`Withdraw the invite for ${grant.email}`}
					class="rounded-full px-1.5 text-chalk/40 transition hover:bg-hairline/40 hover:text-signal"
				>
					✕
				</button>
			</div>
		</li>
	{/each}
</ul>
