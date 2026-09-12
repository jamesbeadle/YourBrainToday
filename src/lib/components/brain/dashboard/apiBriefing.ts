export function agentBriefingFor(baseUrl: string): string {
	return [
		`This is my expertise brain — a curated model of one domain, organised as`,
		`bounded contexts of markdown pages. Use it as my second brain.`,
		``,
		`Base URL: ${baseUrl}`,
		`Auth header on every request: Authorization: Bearer <token>`,
		``,
		`GET  ${baseUrl}`,
		`     → the model index: every context and page with a one-line summary.`,
		`GET  ${baseUrl}/pages/{slug}`,
		`     → one page, full markdown body.`,
		`POST ${baseUrl}/ask   {"question": "..."}`,
		`     → a grounded answer citing the pages it read (spends 10 credits).`,
		`       Pass back "conversationId" from the reply to continue a thread.`,
		`GET  ${baseUrl}/export`,
		`     → the whole model as a zip of markdown files.`,
		``,
		`Navigate it yourself for detail work (index, then read the pages you`,
		`need); use /ask when you want the brain to answer in its own words.`
	].join('\n');
}

export function curlExampleFor(baseUrl: string): string {
	return (
		`curl -X POST ${baseUrl}/ask \\\n` +
		`  -H "Authorization: Bearer YOUR_TOKEN" \\\n` +
		`  -H "content-type: application/json" \\\n` +
		`  -d '{"question": "What do we know about ...?"}'`
	);
}
