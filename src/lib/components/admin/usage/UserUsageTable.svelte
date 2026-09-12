<script lang="ts">
	import UserUsageRow from './UserUsageRow.svelte';
	import type { UserUsageSummary } from '$lib/server/admin/usage/summariseUsageByUser';

	let { users }: { users: UserUsageSummary[] } = $props();
</script>

{#if users.length === 0}
	<p class="rounded-2xl border border-hairline px-5 py-4 text-sm text-chalk/60">
		No credit movements yet.
	</p>
{:else}
	<div class="overflow-x-auto rounded-2xl border border-hairline">
		<table class="w-full text-sm">
			<thead class="bg-carriage/60 text-left font-display text-xs tracking-widest text-chalk/50 uppercase">
				<tr>
					<th class="px-5 py-3">User</th>
					<th class="px-5 py-3 text-right">Bought</th>
					<th class="px-5 py-3 text-right">Granted</th>
					<th class="px-5 py-3 text-right">Spent</th>
					<th class="px-5 py-3 text-right">Refunded</th>
					<th class="px-5 py-3 text-right">Balance</th>
					<th class="px-5 py-3 text-right">Claude cost</th>
					<th class="px-5 py-3 text-right">Revenue</th>
					<th class="px-5 py-3 text-right">Margin</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-hairline">
				{#each users as user (user.userId)}
					<UserUsageRow {user} />
				{/each}
			</tbody>
		</table>
	</div>
{/if}
