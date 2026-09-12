<script lang="ts">
	import LegalArticle from '$lib/components/site/LegalArticle.svelte';
	import { privacyStatement } from '$lib/data/privacyStatement';
</script>

<svelte:head>
	<title>{privacyStatement.title} — Your Brain Today</title>
	<meta name="description" content={privacyStatement.metaDescription} />
</svelte:head>

<LegalArticle legalDocument={privacyStatement} />
