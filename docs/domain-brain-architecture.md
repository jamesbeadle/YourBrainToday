# The Domain Brain — Architecture

How YBT captures what a business knows: every document the company files, read once by a
modeller agent and remembered as a domain model, so any question gets an answer grounded
in the company's own records — and the whole model leaves with the customer as Markdown.

## The product in one sentence

Upload the documents your business files; a modeller agent reads each one and maintains a
domain model — bounded contexts of entities, value objects, aggregates, services, events,
and a glossary of your own vocabulary — that you can browse like a knowledge base,
question like a colleague, and export as Markdown whenever you want it elsewhere.

## The shape: Karpathy's LLM wiki, structured by Evans, stored in Supabase

The mechanics follow the three-layer pattern of an incrementally maintained persistent
wiki (karpathy's LLM-wiki gist); the structure of the pages follows domain-driven design
(Evans, *Domain-Driven Design*, 2003). Supabase stands in for the git repository:

- **Raw sources (immutable)** — uploaded files in the private `brain-sources` Storage
  bucket, catalogued in `brain_sources`. The modeller reads them; nothing ever edits them.
- **The model (modeller-maintained)** — `brain_contexts` and `brain_pages`, written ONLY
  by the modeller agent. Every page overwrite snapshots the previous version into
  `brain_page_revisions`, so the model has history like a ledger.
- **The schema** — the modeller system prompts (`modellerIngestPrompt.ts`,
  `modellerQueryPrompt.ts`) encode the conventions that make a generic model a
  disciplined domain modeller: Evans' building blocks, kebab-case slugs, update-don't-
  duplicate, complete bodies on update, cross-links as `[Title](/domain-brain/slug)`,
  never invent.

Two supporting artefacts complete the pattern, both derived rather than stored: the
**index** (contexts, then pages grouped by building block) is computed from
`brain_contexts` and `brain_pages` on every request — derive what's derivable — and the
**log** is `brain_events`, an append-only record of everything the modeller does,
rendered as the activity panel.

## The Evans structure

**Strategic design.** The model is divided into *bounded contexts* — areas of the
business where one model and one language hold together. Each context is a row in
`brain_contexts`; exactly one carries `is_core_domain`, Evans' distillation of the part
of the business that makes it worth choosing. A singleton page of kind `context_map`
describes how the contexts relate.

**Tactical design.** Every page in `brain_pages` is typed by `kind` as one building
block: `entity` (identity that persists — a client, a project), `value_object` (defined
by attributes — a price list, a standard term), `aggregate` (a cluster treated as one
unit — a project with its tasks and invoices), `domain_service` (a process owned by no
entity — quoting, onboarding), `domain_event` (an occurrence the business reacts to —
contract signed, payment overdue), and one `glossary` page per context holding the
*ubiquitous language* — the vocabulary the business actually uses, in its own words.

## The operations

**Ingest (50 credits).** Upload goes browser → Supabase Storage via a signed upload URL.
The ingest endpoint then: spends credits → downloads the file → turns it into a Claude
content block → hands it to the ingest modeller with the current contexts and index →
applies the returned context writes (≤4) and page writes (≤10, each a complete body,
each typed and placed in a context) → records events → marks the source ingested with a
one-line summary. Any failure marks the source failed and refunds the credits; retry is
one click.

**Query (10 credits).** The query modeller gets the contexts, the index, and the
question, requests the page bodies it needs (one read_pages round — the glossary is often
among them), and answers in the ubiquitous language with citations. The answer and its
cited slugs are recorded as a `question_answered` event, which is also how the ask panel
shows history — the log is the conversation store, no extra tables.

**Export (free).** `GET /api/brain/export` streams a zip of Markdown files generated
straight from the database: one folder per bounded context, one `.md` per page with YAML
frontmatter (title, summary, kind, context, updated), plus `index.md`, `log.md`, and the
context map at the root. No Claude call, so no credit charge — portability is the trust
feature that sells credits elsewhere. Obsidian opens the zip's folder as a vault as-is.

**Lint** — the periodic health-check that finds contradictions, orphaned pages, missing
cross-references, and glossary drift — is the designed next operation, deliberately
deferred.

## Credit metering

| Action | Credits | Reason in credit_ledger |
| --- | --- | --- |
| Document ingest | 50 | `brain_ingest` |
| Failed ingest refund | +50 | `brain_ingest_refund` |
| Question | 10 | `brain_question` |
| Markdown export | 0 | — |

Spending happens in Postgres (`spend_for_brain_ingest`, `spend_for_brain_question`,
`refund_for_brain_ingest`) with the same locking, restriction, and balance idioms as
`spend_for_agent_reply`. Credits are bought in Stripe packs marked up over Claude API
cost — see [stripe-setup.md](./stripe-setup.md) for the unit economics.

## Migration

[migrations/0001_domain_brain.sql](../migrations/0001_domain_brain.sql) — run locally
through [scripts/run-migration.sh](../scripts/run-migration.sh) — is the fresh-start migration:
it drops the old category-based wiki tables, creates `brain_contexts`, and recreates
`brain_pages` and `brain_page_revisions` with `kind` and `context_slug`. Sources, the
storage bucket, events, and every credit function survive untouched. `/brain` redirects
permanently to `/domain-brain`.

## Why this compounds

Each document makes the model denser and every future answer better; each answer shows
its sources, which builds the trust to file more documents. The DDD structure is what
makes the compounding legible: the glossary keeps every answer in the customer's own
words, the context map keeps growth from collapsing into mush, and the export means the
customer owns the result outright. And the model is exactly the corpus the Workforce
will need when it starts running tasks — what the business knows, already structured,
already cross-referenced, already owned by the customer.
