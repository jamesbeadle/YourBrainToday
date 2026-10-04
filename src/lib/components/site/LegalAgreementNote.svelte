<script lang="ts">
	let { action }: { action: string } = $props();

	const linkClasses = 'text-chalk/80 underline underline-offset-4 hover:text-chalk';
</script>

<p class="text-xs text-chalk/50">
	By {action} you agree to our
	<a href="/terms" class={linkClasses}>Terms of service</a>
	and
	<a href="/privacy" class={linkClasses}>Privacy statement</a>.
</p>
