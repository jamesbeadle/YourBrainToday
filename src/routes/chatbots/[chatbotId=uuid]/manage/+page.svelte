<script lang="ts">
	import ChatbotManageHeader from '$lib/components/chatbots/ChatbotManageHeader.svelte';
	import ChatbotMembersSection from '$lib/components/chatbots/ChatbotMembersSection.svelte';
	import ChatbotSettingsSection from '$lib/components/chatbots/ChatbotSettingsSection.svelte';
	import KnowledgeGapsSection from '$lib/components/chatbots/KnowledgeGapsSection.svelte';
	import TopUpForm from '$lib/components/chatbots/TopUpForm.svelte';
	import TopUpHistory from '$lib/components/chatbots/TopUpHistory.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.chatbot.name} — Chatbot — Your Brain Today</title>
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
	<ChatbotManageHeader chatbot={data.chatbot} />
	<KnowledgeGapsSection
		chatbot={data.chatbot}
		openGaps={data.knowledgeGaps.open}
		answeredGaps={data.knowledgeGaps.answered}
		teachingCredits={data.teachingCredits}
	/>
	<ChatbotMembersSection chatbot={data.chatbot} members={data.members} />
	<section class="grid gap-6 lg:grid-cols-[2fr_1fr]">
		<TopUpForm chatbot={data.chatbot} members={data.members} />
		<TopUpHistory topUps={data.topUps} />
	</section>
	<ChatbotSettingsSection chatbot={data.chatbot} />
</div>
