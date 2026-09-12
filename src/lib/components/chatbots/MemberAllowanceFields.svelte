<script lang="ts">
	import type { ChatbotMember } from '$lib/data/chatbotTypes';

	let { members, poolCredits }: { members: ChatbotMember[]; poolCredits: number } = $props();

	let edits = $state<Record<string, number>>({});

	const allowanceFor = (member: ChatbotMember) => edits[member.id] ?? member.allowanceCredits;
	const allowanceTotal = $derived(members.reduce((total, member) => total + allowanceFor(member), 0));
	const isOverAllocated = $derived(allowanceTotal > poolCredits);

	function readEdit(memberId: string, event: Event) {
		const typed = Number((event.currentTarget as HTMLInputElement).value);
		edits[memberId] = Number.isInteger(typed) && typed > 0 ? typed : 0;
	}
</script>

<div class="flex flex-col gap-2">
	<p class="text-[10px] tracking-wider text-chalk/40 uppercase">Allowance per member</p>
	{#each members as member (member.id)}
		<label class="flex items-center gap-3 text-sm">
			<span class="w-40 truncate text-chalk/70 sm:w-64">{member.invitedEmail}</span>
			<input
				type="number"
				name={`allowance:${member.id}`}
				min="0"
				step="1"
				value={allowanceFor(member)}
				defaultValue={allowanceFor(member)}
				oninput={(event) => readEdit(member.id, event)}
				class="w-32 rounded-xl border border-hairline bg-night px-4 py-2 font-mono text-chalk
					outline-none focus:border-signal"
			/>
		</label>
	{/each}
</div>
<p class={`text-xs ${isOverAllocated ? 'text-caution' : 'text-chalk/50'}`}>
	Allowances total {allowanceTotal} of a {poolCredits}-credit pool{isOverAllocated
		? ' — that is fine, but the bot stops answering when the pool runs dry.'
		: '.'}
</p>
