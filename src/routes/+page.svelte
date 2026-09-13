<script lang="ts">
	import BenefitsSection from '$lib/components/home/BenefitsSection.svelte';
	import HeroSection from '$lib/components/home/HeroSection.svelte';
	import KnowledgeKindsSection from '$lib/components/home/KnowledgeKindsSection.svelte';
	import OneConversationSection from '$lib/components/home/OneConversationSection.svelte';
	import ServicesSection from '$lib/components/home/ServicesSection.svelte';
	import { companyDetails } from '$lib/data/companyDetails';

	const pageTitle = 'Your Brain Today — the knowledge base your business can be asked';
	const pageDescription =
		'Your Brain Today holds what your business knows, has done, and how it works — expertise, experience and process — in one knowledge base. Build it by interview or from the documents you already file, then hand it to your staff as a chatbot or connect it to Claude.';
	const shareImageUrl = `${companyDetails.websiteUrl}/favicon.svg`;
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:url" content={companyDetails.websiteUrl} />
	<meta property="og:image" content={shareImageUrl} />
</svelte:head>

<HeroSection />
<KnowledgeKindsSection />
<OneConversationSection />
<ServicesSection />
<BenefitsSection />
