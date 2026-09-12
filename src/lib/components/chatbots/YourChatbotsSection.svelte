<script lang="ts">
	import type { MemberChatbot } from '$lib/data/chatbotTypes';

	let { chatbots, title = 'Your chatbots' }: { chatbots: MemberChatbot[]; title?: string } = $props();
</script>

<section class="flex flex-col gap-3">
	<h2 class="font-display text-xs tracking-widest text-chalk/50 uppercase">{title}</h2>
	<ul class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
		{#each chatbots as chatbot (chatbot.id)}
			<li>
				<a
					href={`/chatbots/${chatbot.id}`}
					class="group flex flex-col gap-1 rounded-2xl border border-hairline bg-carriage p-5
						transition hover:border-chalk/30"
				>
					<span class="font-display text-base text-chalk transition group-hover:text-signal">
						{chatbot.name}
					</span>
					<span class="text-xs text-chalk/50">
						{chatbot.isPaused
							? 'Paused'
							: `${chatbot.allowanceCredits - chatbot.spentCredits} of ${chatbot.allowanceCredits} credits left`}
					</span>
				</a>
			</li>
		{/each}
	</ul>
</section>
