<script lang="ts">
	import BrandMark from '../site/BrandMark.svelte';
</script>

<div class="flex items-center gap-3">
	<BrandMark size={30} />
	<div
		class="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-hairline bg-night
			px-4 py-3.5"
	>
		<span class="h-2 w-2 animate-bounce rounded-full bg-chalk/40"></span>
		<span class="h-2 w-2 animate-bounce rounded-full bg-chalk/40 [animation-delay:150ms]"></span>
		<span class="h-2 w-2 animate-bounce rounded-full bg-chalk/40 [animation-delay:300ms]"></span>
	</div>
</div>
