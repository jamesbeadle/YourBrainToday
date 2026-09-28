export function agentBriefingFor(brainUrl: string, knowledgeBaseUrl: string): string {
	return [
		`This is my knowledge base on Your Brain Today — four brains: expertise (what`,
		`the business knows, as a domain model), experience (what it has done),`,
		`process (how it works) and human (who it knows). Use it as my second brain.`,
		``,
		`Knowledge base: ${knowledgeBaseUrl}`,
		`Expertise brain: ${brainUrl}`,
		`Auth header on every request: Authorization: Bearer <token>`,
		``,
		`GET  ${knowledgeBaseUrl}`,
		`     → the four brains: what each holds, the expertise index, the experience`,
		`       entries, the process map and the people, plus the same markdown the`,
		`       orchestrator reads. Add ?brains=process,human to narrow it.`,
		`POST ${knowledgeBaseUrl}/ask   {"question": "...", "brains": ["process"]}`,
		`     → one grounded answer from whichever brains hold it, citing the pages`,
		`       it read and naming the brains it drew on (spends credits). "brains"`,
		`       is optional — leave it out to ask all four.`,
		`GET  ${brainUrl}/pages/{slug}`,
		`     → one expertise page, full markdown body.`,
		`POST ${brainUrl}/ask   {"question": "..."}`,
		`     → the expertise brain alone, in conversation; pass back "conversationId".`,
		`POST ${brainUrl}/ingest   {"title": "...", "text": "..."}`,
		`     → teaches the brains: the text is read like an uploaded document and`,
		`       appears in the ingested data (priced like an upload of that size).`,
		`GET  ${brainUrl}/export`,
		`     → the expertise model as a zip of markdown files.`,
		``,
		`Read the knowledge base yourself for detail work (GET it, then the pages you`,
		`need — reading is free); use /ask when you want it to answer in its own words.`
	].join('\n');
}

export function curlExampleFor(knowledgeBaseUrl: string): string {
	return (
		`curl -X POST ${knowledgeBaseUrl}/ask \\\n` +
		`  -H "Authorization: Bearer YOUR_TOKEN" \\\n` +
		`  -H "content-type: application/json" \\\n` +
		`  -d '{"question": "Who signs off a variation, and what happened last time?"}'`
	);
}
