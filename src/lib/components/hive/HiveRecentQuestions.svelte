<script lang="ts">
	import MarkdownBody from '../brain/MarkdownBody.svelte';
	import type { HiveQuestionRecord } from '$lib/server/hive/getRecentHiveQuestions';

	let { questions }: { questions: HiveQuestionRecord[] } = $props();
</script>

<section class="mx-auto max-w-6xl px-6 pb-16">
	<div class="flex flex-col gap-4">
		<h2 class="font-display text-xl font-medium">Your recent questions</h2>
		<ul class="flex flex-col gap-3">
			{#each questions as record (record.id)}
				<li>
					<details class="group rounded-2xl border border-hairline bg-carriage">
						<summary
							class="cursor-pointer list-none px-5 py-4 font-display text-sm text-chalk/80
								transition group-open:text-signal hover:text-chalk"
						>
							{record.question}
						</summary>
						<div class="border-t border-hairline px-5 py-4">
							<MarkdownBody markdown={record.answerMarkdown} />
						</div>
					</details>
				</li>
			{/each}
		</ul>
	</div>
</section>
