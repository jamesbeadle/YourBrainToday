<script lang="ts">
	import type { HiveMember } from '$lib/data/hiveTypes';

	let { member }: { member: HiveMember } = $props();

	const joinedDate = $derived(
		new Date(member.approvedAt).toLocaleDateString('en-GB', {
			month: 'short',
			year: 'numeric'
		})
	);
</script>

<article class="flex flex-col gap-3 rounded-2xl border border-hairline bg-night p-6">
	<h3 class="font-display text-lg font-medium">{member.specialtyName}</h3>
	<p class="flex-1 text-sm text-chalk/70">{member.pitch}</p>
	<p class="font-display text-xs text-chalk/50">
		Consulted {member.questionCount}
		{member.questionCount === 1 ? 'time' : 'times'} · In the hive since {joinedDate}
	</p>
</article>
