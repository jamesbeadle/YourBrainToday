# YBT Consolidation Spec

**From prototype to product.** 2026-08-29. Status: draft for agreement.

YBT today presents five products side by side. The prototype proved each idea works; the product needs them to read as one idea. This spec defines that one idea — a business and its knowledge — and traces every change from it: the knowledge taxonomy, the language users see, the template set, the homepage, and the cleanup work that has to ride along.

## The Core Concept

YBT builds your business a brain. Not a metaphorical one — a brain with the same three kinds of memory a real one has:

| Memory system | Knowledge type | The question it answers | Today's implementation |
|---|---|---|---|
| Semantic | **Expertise** | *What do you know?* | Domain brains (`domain` category, DDD per Evans) |
| Episodic | **Experience** | *What have you done?* | Instance brains (`instance` category, bound to a domain) |
| Procedural | **Process** | *How do you work?* | The Workflow Map (currently a separate product) |

This taxonomy is complete. Cognitive science recognises exactly these three stored memory systems, which is why no fourth type is proposed:

- **Relationship / market knowledge** ("who you know") decomposes into Expertise about people-shaped concepts plus Experience of dealings with them. The Prospector consumes this; it doesn't need its own type.
- **Transactional records** (invoices, ledger entries) are systems of record, not knowledge. They already live in `/accounting` and stay there. The brain may *reference* them; it never *stores* them.

The distinction between Expertise and Experience teaches itself in one sentence, which becomes the canonical copy used everywhere the two appear together:

> *Your expertise sets the rules of your trade. Your experience is the record of every job done within them.*

In DDD terms (kept out of the UI, kept in our heads): Expertise is the ubiquitous language, entities, and invariants; Experience is the stream of domain events — occurrences that are only meaningful inside the language the domain defines; Process is the sagas and workflows that move work between them. The construction example: the Expertise brain knows what a snag, a variation order, and a sign-off *are*; the Experience brain records that *this* project raised *that* variation order on *that* date; the Process map shows how a variation order travels from site to office to client.

## Naming Decision

Recommended: **Expertise / Experience / Process**. Short, business-plain, and the near-twin pairing of the first two is a feature — it invites the one-sentence explanation above.

Alternatives considered, kept for the record: *Know-how / Track record / Ways of working* (warmer, but three different shapes don't read as a set); *Playbook / Journal / Map* (concrete, but these are better used as **template names inside** the types, see below).

Terms being retired from user-facing copy:

- "Domain Brain" as a product name. A brain now *has* a type; the DDD modeller becomes the flagship template of the Expertise type.
- "domain" and "instance" as user-visible category labels (`categoryLabels` in `brainTypeCatalog.ts`). They remain internal identifiers — no schema migration is forced by a rename at the presentation layer.
- Storage-strategy labels as template names ("Hybrid Graph + Vector", "Vector Chunk Store", "Temporal Knowledge Graph"). Users choose what to capture, never how it's stored.

## Visual Language

Every brain, everywhere it appears (knowledge base grid, pickers, share views), carries its type in three redundant ways so no single cue does all the work:

1. **Accent colour** on the glyph. Expertise keeps blue `#9db6ff`, Experience keeps green `#8fe6bd` (both already in `categoryAccents`); Process gets an amber accent drawn from the existing theme tokens rather than a new inline hex.
2. **Tag chip** with the type name, in the accent colour, on every brain card.
3. **Glyph shape.** Expertise and Experience stay as `BrainGlyph` constellations. Process is *not* drawn as a brain — the workflow diagram itself, miniaturised, is its icon. This asymmetry is deliberate: a process is something you look *at*, not *into*.

## Templates: 16 Types → a Business Set

The current catalog exposes 16 brain types named by mechanism. The product exposes **7 templates named by job**, each backed by an existing type as its engine. Nothing is deleted — types not surfaced as templates become engines or move behind an "advanced" affordance.

### Expertise templates

| Template | Engine (`brain_type`) | Pitch to the user |
|---|---|---|
| **Trade Playbook** | `ddd_model` | The flagship. What your business knows, modelled properly — the existing domain brain editor. |
| **Rules & Standards** | `rules` | Regulations, policies, and the constraints your work must satisfy. |
| **Industry Glossary** | `taxonomy` | The language of your trade — terms, categories, and how they relate. |

### Experience templates

| Template | Engine (`brain_type`) | Pitch to the user |
|---|---|---|
| **Project Log** | `episodic_log` | Everything that happened on a job, as it happened, in your trade's own terms. |
| **Client & Job Records** | `typed_records` | Structured records whose forms are generated from your bound Playbook (existing `boundSchemaTypes` behaviour). |
| **Company Wiki** | `llm_wiki` | The living reference your team actually reads. |
| **Daily Log** | `journal` | The running diary of the business. |

### Process

The Workflow Map, pulled in from the separate project as the single Process offering. Phase 3 below.

### Reclassified, not removed

`ontology` folds under Trade Playbook as an advanced option; `event_schema` becomes internal to Experience (it defines what an Experience entry can be — users never pick it); `process` (the brain type) is superseded by the real Workflow Map; `hybrid_pack`, `atomic_notes`, `outliner`, `temporal_graph`, `hybrid_graph_vector`, and `vector_store` become retrieval/storage engines reachable only through an "advanced" creation path, off by default. Existing brains of these types keep working; they render with their type's editor as today.

Per the knowledge-base design rule that still holds: new templates are catalog entries plus an editor — content stays on `kb_brain_items`, never new tables.

## The Interviewer

One agent, one conversation, three kinds of memory written at once. The same interview inputs that currently build a domain model also carry episodic and procedural signal: when the user says "then we send the survey back to the client for sign-off", that sentence populates the Playbook (a *sign-off* exists), the Process map (a step and a handover), and — on a real project — the Experience log (a sign-off *happened*). The interviewer is the mechanism that makes the three-type story true rather than decorative, which is why it's on the punch list as a feature and not a nicety. Its architecture builds on `docs/interview-architecture.md`.

## Homepage Restructure

The current page leads with five co-equal products — the scatter this consolidation exists to fix. The restructure inverts it: one concept stated confidently, then services that draw on it.

1. **Hero** — one claim: *YBT builds your business a brain.* Sub-line introduces the three kinds of knowledge in the canonical sentence pattern. The five-product recital in the hero paragraph and `<meta>` description goes.
2. **Three kinds of knowledge** — replaces the current "Ecosystem" grid's framing. Three cards: Expertise, Experience, Process, each with its accent colour, its question, and a concrete trade example. This is the section that does the teaching.
3. **Services powered by your knowledge** — Hive Mind, Workforce, and Prospector repositioned as services that *consume* the brain rather than sibling products: the Hive Mind shares your expertise (and pays you for it), the Workforce runs your processes, the Prospector applies your experience of good clients to find the next ones. The Workflow Map is no longer listed as a product here — it *is* the Process knowledge type and lives in section 2.
4. **Demos, shared profile, credits** — retained, re-copyedited to the new language.

Tone shift throughout: fewer ideas per sentence, business vocabulary, no mechanism talk. Professional means one idea at a time.

## User Stories the Consolidation Serves

As a **business owner**, I want my knowledge base to show at a glance which brains hold what kind of knowledge, so I understand what my business's brain knows without learning our jargon.

As a **business owner**, I want to create a brain by choosing what I want to capture (a project log, my trade's playbook), not a storage technology, so setup feels like a business decision.

As a **tradesperson running projects**, I want each project's events recorded in the terms my Playbook defines, so my experience compounds instead of scattering.

As a **first-time visitor**, I want the homepage to tell me in one sentence what YBT is, so I can decide in ten seconds whether it's for me.

As a **user being interviewed**, I want one conversation to build all three kinds of knowledge, so I never repeat myself to different tools.

## Phasing

**Phase 1 — Language and the knowledge UI.** DONE 2026-08-29. Renamed at the presentation layer, catalog collapsed into the template set, tag chips and Process accent added, advanced types gated.

**Phase 2 — Homepage.** DONE 2026-08-29. The four-section restructure shipped.

**Phase 3 — Process integration.** DONE 2026-08-29. Process maps appear as the third section on the knowledge base page (diagram-as-icon, amber accent), linked through the base's Trade Playbook to its business's workspace.

**Phase 4 — Interviewer.** DONE 2026-08-29 (first cut). The workspace interview's single Claude call now returns the map plus harvested expertise facts and experience events; the server files them into the linked knowledge base's Rules & Standards and Interview Log brains, creating those brains on first harvest. Sitewide language sweep also complete: "Domain Brain" → expertise brain, "Workflow Map" → process map, everywhere user-facing.

**Parallel — the punch list.** DONE 2026-08-29: the app-wide saving overlay is removed (the modal layer the chat sat under — the enter-key delay fix), knowledge modals became inline panels and remaining modals lost their backdrop blur; todos expand inline on /tasks to show details, the story, and meta without a clickthrough; AI endpoints cleaned (maxDuration on every Anthropic route, dead superseded files removed).

## Out of Scope

A fourth knowledge type; any schema migration driven purely by renaming; changes to `/accounting`, `/tasks` internals, or the Hive Mind review flow beyond copy; deleting any existing brain type or user data.


## V2 Restructure — 2026-08-30

Directed by Nigel and shipped in full. The generic structure is now named the **second brain**; the three kinds (Expertise, Experience, Process) are its only types.

**Navigation and routes.** Workspace left the nav and its index redirects to the knowledge base; `/knowledge` became `/knowledge-base` (old links redirect); Market is labelled **Marketplace**; the Hive Mind is now **Trade Talk** at `/trade-talk`. Early access left the footer.

**Homepage.** Rebuilt: hero ("Your business, with a second brain") with the three-node SecondBrainMark; the three-kinds section; "Talk about your business. That's it." — a generic business section showing one answer filed three ways; an up-to-date benefits section; services (Trade Talk, Marketplace, Workforce, Prospector). Demos and pay-as-you-go removed.

**Knowledge base.** The index is a register of every second brain grouped by knowledge base — type chip in its kind colour, related entity, click-through — plus invitations, shared-with-you, and unfiled-brain filing absorbed from the old workspace page. The knowledge base detail page is the hub: the three brain sections, then the workbench — the Interview (asks pertinent questions from the KB's own gaps, files every answer as expertise/experience), Source documents, Review changes, Sell on the marketplace, Trade Talk, API access, and the log at the bottom. Sharing stays at knowledge-base level. Brain-level pages keep only the constellation, a query-only terminal ("query your brain"), the model, and settings (goal + delete); ingest moved up to the knowledge base.

**Creation.** New-brain flow offers exactly the three kinds, colour-distinguished; Expertise creates the DDD-modelled brain (the existing one), Experience an episodic store, Process a workflow map. The 16-type template catalog and the non-business workspace template gallery were removed.

**Trade Talk.** Full rebrand with trade-first copy; a revenue-share panel in the account shows credits earned when answers draw on your knowledge base, ahead of Stripe payouts.

**Dynamic pricing.** Migration `0028_dynamic_credits.sql` (MUST be run once) adds `spend_credits_for` / `refund_credits_for`. Ingest is priced by document size, Trade Talk by pages consulted beyond the included depth, interview turns and harvest filings by items written; rates live in `creditPricing.ts` so margins stay in one place. Fixed-price copy across the site now says credits scale with the work.
