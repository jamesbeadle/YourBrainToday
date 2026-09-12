<script lang="ts">
	import MemberModelSelect from './MemberModelSelect.svelte';
	import RemoveMemberButton from './RemoveMemberButton.svelte';
	import ResendInviteButton from './ResendInviteButton.svelte';
	import type { ChatbotMember } from '$lib/data/chatbotTypes';

	let { member }: { member: ChatbotMember } = $props();
</script>

<div class="flex flex-col gap-2 rounded-xl border border-hairline bg-night p-3 text-sm">
	<div class="flex items-center justify-between gap-2">
		<span class="truncate">{member.invitedEmail}</span>
		<span class="shrink-0 text-xs text-chalk/60">{member.hasJoined ? 'Joined' : 'Invited'}</span>
	</div>
	<div class="flex items-center justify-between gap-2 font-mono text-xs text-chalk/70">
		<span>{member.spentCredits} of {member.allowanceCredits} credits spent</span>
		<span class="flex items-center gap-2">
			<MemberModelSelect memberId={member.id} modelId={member.modelId} />
			{#if !member.hasJoined}
				<ResendInviteButton memberId={member.id} />
			{/if}
			<RemoveMemberButton memberId={member.id} />
		</span>
	</div>
</div>
