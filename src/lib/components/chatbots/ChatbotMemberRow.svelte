<script lang="ts">
	import MemberModelSelect from './MemberModelSelect.svelte';
	import RemoveMemberButton from './RemoveMemberButton.svelte';
	import ResendInviteButton from './ResendInviteButton.svelte';
	import type { ChatbotMember } from '$lib/data/chatbotTypes';

	let { member }: { member: ChatbotMember } = $props();
</script>

<tr>
	<td class="py-2 pr-3">{member.invitedEmail}</td>
	<td class="py-2 pr-3 text-chalk/60">{member.hasJoined ? 'Joined' : 'Invited'}</td>
	<td class="py-2 pr-3"><MemberModelSelect memberId={member.id} modelId={member.modelId} /></td>
	<td class="py-2 pr-3 text-right font-mono">{member.allowanceCredits}</td>
	<td class="py-2 pr-3 text-right font-mono">{member.spentCredits}</td>
	<td class="py-2 text-right">
		<span class="inline-flex items-center justify-end gap-2">
			{#if !member.hasJoined}
				<ResendInviteButton memberId={member.id} />
			{/if}
			<RemoveMemberButton memberId={member.id} />
		</span>
	</td>
</tr>
