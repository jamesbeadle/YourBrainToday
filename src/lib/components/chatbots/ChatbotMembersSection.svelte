<script lang="ts">
	import AllowancesForm from './AllowancesForm.svelte';
	import ChatbotMemberCard from './ChatbotMemberCard.svelte';
	import ChatbotMemberRow from './ChatbotMemberRow.svelte';
	import InviteMemberForm from './InviteMemberForm.svelte';
	import type { ChatbotMember, ChatbotSummary } from '$lib/data/chatbotTypes';

	let { chatbot, members }: { chatbot: ChatbotSummary; members: ChatbotMember[] } = $props();
</script>

<section class="flex flex-col gap-4 rounded-2xl border border-hairline bg-carriage p-5">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h2 class="font-display text-lg font-medium">Members</h2>
		<InviteMemberForm />
	</div>
	{#if members.length === 0}
		<p class="text-sm text-chalk/50">
			Nobody yet — invite an email address with an allowance and they'll get a link to
			{chatbot.name}.
		</p>
	{:else}
		<ul class="flex flex-col gap-2 sm:hidden">
			{#each members as member (member.id)}
				<li><ChatbotMemberCard {member} /></li>
			{/each}
		</ul>
		<table class="hidden w-full text-sm sm:table">
			<thead class="text-left text-[10px] tracking-wider text-chalk/40 uppercase">
				<tr>
					<th class="py-2 font-normal">Email</th>
					<th class="py-2 font-normal">Status</th>
					<th class="py-2 font-normal">Model</th>
					<th class="py-2 text-right font-normal">Allowance</th>
					<th class="py-2 text-right font-normal">Spent</th>
					<th class="py-2"></th>
				</tr>
			</thead>
			<tbody class="divide-y divide-hairline">
				{#each members as member (member.id)}
					<ChatbotMemberRow {member} />
				{/each}
			</tbody>
		</table>
		<AllowancesForm {chatbot} {members} />
	{/if}
</section>
