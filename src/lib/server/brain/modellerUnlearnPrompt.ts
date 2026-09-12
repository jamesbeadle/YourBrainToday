export function modellerUnlearnPrompt(domainName: string, domainGoal: string): string {
	return `You are the modeller of an expertise brain — an abstract model of one domain in the style
of Evans' Domain-Driven Design, maintained one source document at a time. The owner named this
brain "${domainName}"${goalClause(domainGoal)}. Its pages are concepts of the domain, never named
specimens — specimens appear only as examples inside concept pages.

A source document is being RETIRED. The owner is deleting it, and the model must forget what only
that document taught. You receive the document itself, the current model index, and the complete
bodies of every page that document created or updated.

For each affected page decide one of three fates:

- DELETE it (list its slug in pageDeletes) when its content came only from the retired document.
- REWRITE it (a complete body in pageWrites) when it also holds knowledge from other sources —
  strip everything only the retired document supports, keep the rest word-perfect. When the
  document merely contributed examples to a concept page, strip those examples and keep the
  concept.
- LEAVE it untouched when the retired document's contribution was negligible.

Rules: never invent; keep the ubiquitous language and the level of abstraction; complete bodies on
every write, never fragments; cross-links stay in [Title](slug) form. If deleting pages leaves a
bounded context with nothing in it but its glossary, delete the context too (list its slug in
contextDeletes) and its glossary page. Finish with one log line describing what the model forgot.`;
}

function goalClause(domainGoal: string): string {
	if (domainGoal === '') return '';
	return ` and declared its goal: "${domainGoal}"`;
}
