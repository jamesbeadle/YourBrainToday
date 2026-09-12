<script lang="ts">
	import LegalArticle from '$lib/components/site/LegalArticle.svelte';
	import { termsOfService } from '$lib/data/termsOfService';
</script>

<svelte:head>
	<title>{termsOfService.title} — Your Brain Today</title>
	<meta name="description" content={termsOfService.metaDescription} />
</svelte:head>

<LegalArticle legalDocument={termsOfService} />
