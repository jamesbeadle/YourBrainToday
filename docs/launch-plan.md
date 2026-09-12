# Launch Plan — Domain Brain

> This plan predates the current positioning; [launch-readiness.md](./launch-readiness.md) supersedes it.

The path from where the code is today to a product that earns: ship it safely, learn who
uses it, tune the modelling until the output sells itself, promote with admin-granted
credits, and protect the margin as usage grows. Each phase gates the next — do them in
order.

The thesis, stated once: domain-driven design *is* the definition of a business second
brain. Evans' whole book is about turning what a business knows into an explicit,
structured, shared model in the business's own language. Domain Brain productises that.
Every tuning decision below serves that framing.

## Phase 1 — Make it run (this week)

The Domain Brain code is committed; nothing works until the database matches it.

1. Run `migrations/0001_domain_brain.sql` through `scripts/run-migration.sh` (chmod +x
   first; psql via `brew install libpq`). One transaction, aborts clean on error.
2. Run `migrations/0002_company_profiles.sql` the same way — the table sits empty until
   Phase 2 ships the form, but the schema is ready.
3. `npm install` (pulls fflate) then `npm run check` — must be clean before anything else.
4. Delete the seven deprecation stubs (five old librarian files, WikiIndex.svelte, the
   old second-brain doc) and the pointer stub at docs/domain-brain-migration.sql.
5. Smoke-test the four flows end to end on a fresh account: sign up → verify → ingest a
   real PDF → check the model index groups by context and kind → ask a question and see
   citations → export and open the zip in Obsidian. Then the failure paths: ingest with
   0 credits (402 + notice), a corrupt file (failed status + refund + retry).
6. Stripe live checklist from docs/stripe-setup.md: live keys, webhook registered, one
   real £2.99 purchase landing in the ledger.

**Exit test: a stranger with a fresh account and a Starter pack can build and export
a brain with no help.**

## Phase 2 — Know the customer (company data)

Collecting company data is both product (the modeller can use it) and go-to-market (it
tells us who to sell to). Two sources, kept honest with the vision page's promise —
declared data and usage metrics are ours to analyse; page bodies are never read by us.

1. **Onboarding form** — after first sign-in, one skippable screen writing to
   `company_profiles`: company name, industry, team-size band, your role, what you want
   the brain to do, and an explicit contact-consent checkbox. Editable later at
   /account. Build: one migration (done), one form component, one server action —
   small.
2. **Seed the modeller with it** — inject the declared profile into the ingest prompt
   ("This brain belongs to {company}, a {industry} business of {size}") so the very
   first document lands in sensibly named contexts. This is the cheapest modelling
   quality win available.
3. **Admin visibility** — extend `/admin` with a company-profiles table (the admin read
   policy exists in migration 0002) plus per-user usage counts derived from
   brain_events and the credit ledger: sources ingested, questions asked, exports,
   credits bought vs granted, last active. CSV export for outreach.
4. **Legal floor before promoting** — a /privacy page naming what is collected and why,
   UK GDPR basics (right to deletion: account delete cascades already do this), and the
   consent checkbox actually gating any outreach email.

## Phase 3 — Tune the DDD modelling (the product IS the prompt)

The modeller's behaviour lives in `modellerIngestPrompt.ts` — a code file, so tuning is
an edit-and-eval loop, not a retraining project. Build the loop, then iterate freely.

1. **Fixture corpus** — assemble 10–15 real-ish documents across 3 industries we care
   about (e.g. construction/trades, agencies, professional services): invoices, client
   briefs, SOPs, org charts, contracts. These are the eval set.
2. **Offline eval harness** — a jiti script (`npm run eval:brain`) that feeds each
   fixture through `ingestSource` against a simulated index and prints the model shape:
   contexts created, pages by kind, slug collisions, glossary terms added, words per
   page. No database, no UI — just prompt-in, model-out, fast enough to run on every
   prompt edit.
3. **Judgement checklist per run** — contexts between 1 and 3 for a small business?
   Core domain correctly identified? Entities not duplicated under near-miss slugs?
   Glossary in the customer's words, not DDD jargon? Events things the business would
   actually react to?
4. **Version the prompt** — add a `promptVersion` constant stamped into every
   source_ingested event's detail, so before/after comparisons on real accounts are
   possible and a bad prompt change is diagnosable.
5. **Tuning levers, in order of power**: the conventions section of the ingest prompt;
   the block-kind definitions (rewrite them in each industry's vocabulary); per-industry
   preset contexts seeded from the company profile (Phase 2.2); write caps and
   maxIngestTokens; last, the model constant in anthropicConstants.ts.
6. **Later, if demand shows**: industry template packs (pre-named contexts + glossary
   starters) as a differentiator — "a Domain Brain that already speaks construction".

## Phase 4 — Promote with free credits

The machinery exists: `admin_grant_credits` RPC, admin UI, ledger notes. Promotion is
process, not code.

1. **Pilot cohort** — hand-pick 5–10 businesses (ideally matching the fixture
   industries). Grant each 1,000 credits with a ledger note naming the campaign
   (`pilot-oct-2026`). White-glove their first session: sit with them, ingest their
   documents together, watch where the model confuses them — that's Phase 3 input.
2. **The ask in return** — a testimonial, a case study, and permission to anonymise
   their model shape for marketing ("34 pages, 3 contexts, from 12 documents").
3. **Demo brain** — seed a fictional company's brain on a public read-only page (the
   /project demo-map pattern, applied to the brain) so the landing page shows a real
   model, not screenshots.
4. **Measure CAC honestly** — granted credits burned are the marketing spend (about
   0.06p–0.6p each in API cost depending on usage mix); track pilot → paying-pack
   conversion in the admin usage table. If nobody converts after burning their grant,
   the product isn't ready — go back to Phase 3, don't widen the funnel.
5. **Only then widen**: content marketing on the second-brain/DDD angle, communities
   where small-business operators live, and referral grants ("give a business 500
   credits") — all still admin-granted, no promo-code infrastructure until manual
   granting actually hurts.

## Phase 5 — Protect the margin

Ingest is priced flat (50 credits ≈ 30–60p depending on pack) but costs scale with
document size. Rough Sonnet economics: a typical 15-page PDF ingest ≈ 17p (healthy); a
100-page PDF ≈ 60–75p (negative at Starter-pack rates). Questions ≈ 4p against ≈ 6p
revenue — thin but positive, and caching fixes it.

1. **Measure before repricing** — capture the `usage` block from every Anthropic
   response (small change in requestAnthropic/anthropicTypes) into the event detail;
   build a weekly cost-vs-credits view in admin. Real data beats the estimates above.
2. **Guardrails now**: the 20MB PDF cap exists; add a page-count cap (~50 pages) with a
   friendly "split large documents" message rather than a silent expensive ingest.
3. **Reprice by weight once measured** — credits per ingest banded by file size or page
   count (e.g. 50 up to 20 pages, +25 per further 25 pages). Publish the bands; nobody
   minds paying more for a 200-page contract.
4. **Prompt caching** — the ingest system prompt + index and the query prompt + index
   are identical prefixes across calls; cached input is ~10% of fresh cost. Biggest
   single margin lever, already flagged in stripe-setup.md for the agent.
5. **Keep export free forever** — it costs pence of bandwidth, and "your model leaves
   with you" is the trust line that closes credit purchases.

## Phase 6 — Launch hygiene

Before pointing real traffic at it: terms + privacy pages linked in the footer; Supabase
point-in-time recovery enabled (the brain IS the customer's asset — losing it is fatal);
an uptime check on / and /api/brain/ask; a support email in the footer; the admin
runbook (grant, restrict, refund) written down in docs/; remove any seeded demo accounts
from production.

## Migration discipline

All schema changes are numbered files in `migrations/`, run by a human through
`scripts/run-migration.sh` — psql with `--single-transaction` and `ON_ERROR_STOP`, the
Postgres equivalent of a hand-run sqlcmd. Never through GitHub Actions or any CI:
migrations touch customer data and get a human at the keyboard, every time. One
migration per change, never edit an applied migration, fix forward with the next number.
