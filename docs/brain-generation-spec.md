# Brain Generation Spec

**How each second brain generates content.** 2026-08-30. Status: methodologies confirmed by Nigel.

One language, three disciplines. The Expertise brain's ubiquitous language (DDD per Evans, already built, untouched by this spec) is the spine; the other two brains each use the method native to their kind of memory, and every writer — interview, workflow chat, document ingest — obeys one shared rule before it writes anywhere.

## Selection Criteria

A methodology was selected for each brain against five tests: it must match the memory type's native shape (types vs events vs flows); be palatable to a non-technical owner; give the AI a *generative discipline* — a definition of valid and complete, so agents know what to write and when to stop; share the ubiquitous-language spine so the brains interlock; and fit the existing storage (`kb_brain_items`, the workflow model) without migrations.

| Brain | Methodology | Source discipline |
|---|---|---|
| Expertise | Structural DDD — bounded contexts, entities, rules, glossary | Evans (as built — not changed by this spec) |
| Experience | **Domain event streams grouped into case files** | Domain events (Vernon), event storming (Brandolini), case frame from case-based reasoning |
| Process | **The universal structure + five completeness axioms, with context mapping at handovers** | docs/interview-architecture.md (value-stream mapping made rigorous) + Evans' context maps |

## The Vocabulary Contract

The rule that binds the three brains: **every noun a writer records must be expressed in the playbook's terms.** Concretely, each writer receives the Expertise brain's page index (titles = the ubiquitous language) in its prompt and is instructed to name things with those terms. Server-side, the Experience writer resolves each event's terms against that index and splits them:

- **Known terms** link the event to the expertise pages it conforms to.
- **Unknown terms** are not errors — they are discoveries, kept on the event as `newTerms` and surfaced as candidate additions to the expertise brain (via the existing review-changes gate; nothing enters the playbook without the owner).

Strings become edges. The same contract applies to Process: task inputs and outputs are written with the identical phrase as the output that feeds them (already a hard rule in the workflow prompt), and those phrases should be playbook terms.

## Experience: Events in Case Files

### The event

An experience entry is a **domain event**: something that happened, named in the **past tense**, in the playbook's vocabulary, that the business would care to remember. "Variation order signed off", not "sign-off process". Stored as a `kb_brain_items` row:

| Field | Storage | Content |
|---|---|---|
| Event name | `title` | Past tense, playbook vocabulary, starts with the subject where natural |
| Narrative | `body` | The owner's own words — never paraphrased away |
| When | `occurred_at` | Stated time if given, else time of capture |
| Case | `parent_item_id` | The case file this event belongs to |
| Terms | `data.terms` / `data.newTerms` | Playbook terms it touches / terms the playbook doesn't know yet |
| Actors | `data.actors` | Who did it or was involved |
| Provenance | `data.provenance` | `stated` (owner said it) or the reporting source |

### The case

Events cluster into **case files** — a job, a client, a season: the unit the business thinks in. A case is a `kb_brain_items` row with `item_kind: 'case'`, `title` = the case name ("Hartley job"), and a case-based-reasoning frame in `data`: `problem` (what the case set out to do), `approach` (how it was handled), `outcome` (how it ended), `status` (`open`/`closed`). Events reference their case by `parent_item_id`. The frame fields start empty and are filled as the story emerges — the writer updates them when an event clearly states them.

The query Experience exists to answer is **precedent lookup**: "have we seen this before, and what worked?" Cases carrying problem→approach→outcome make that a retrieval over frames, not a read through a diary.

### The writer

`experienceWriter` receives harvested events (from the interview, the workflow chat, or future document routing), each carrying `title`, `note`, `occurredAt?`, `caseName?`, `terms?`. For each event it: finds or creates the case by name within the Experience brain (case-insensitive match on existing `case` items; no `caseName` files the event caseless); resolves `terms` against the Expertise page index into `terms`/`newTerms`; writes the episode with `parent_item_id` pointing at its case. Events are append-only — never rewritten, per the episodic-log principle already in the product.

### The prompts

Harvest instructions (interview + workflow chat tools) gain the event grammar: past-tense names; the owner's words in the note; `caseName` whenever the owner names a job, client, or engagement; `terms` listing the trade concepts touched. The interviewer's context already carries the expertise page titles — the prompt now says to name events with them.

## Process: Axioms with Context Mapping

The methodology is the one `docs/interview-architecture.md` already defines — external parties, roles, tasks transforming inputs into outputs, journeys traced by matching output names to input names, five completeness axioms, the gap taxonomy as the question space. This spec adds two commitments:

1. **Context mapping at handovers.** A handover is a boundary crossing, and boundaries are where meaning is lost — Evans' context-map insight. The failure note the axioms demand on every interchange is the record of that boundary's cost. When the interview learns what goes wrong at a handover, it lands as the handover's `failureNote`; recurring handover failures in Experience (below) propose new ones.
2. **The vocabulary contract on edges.** Inputs and outputs are playbook terms; an edge whose phrase the playbook doesn't know surfaces the term as an expertise candidate, same as Experience does.

Generation stays where it lives today: the workflow chat's single call returns the full updated map; the interview's process learnings route through the same map-update mechanism (build follow-up). Anything the agent concluded rather than heard stays `provenance: 'inferred'` until the owner confirms it — axiom five.

## The Promotion Loop

How episodic memory becomes semantic memory — the consolidation a real brain does overnight:

- **Experience → Expertise:** an unknown term on an event, or the same pattern across cases ("client held up sign-off" three jobs running), becomes a proposed playbook addition or rule. Gate: the existing review-changes flow.
- **Experience → Process:** a repeated event sequence across cases suggests a task or handover the map lacks; a repeated failure at a known handover proposes its failure note.
- **Expertise → Experience/Process:** when the playbook renames or adds a term, writers use it from the next capture; nothing is retro-rewritten (events are history).

Promotions are follow-up builds; the event/term structure this spec defines is what makes them computable later without re-reading raw text.

## Build Order

1. **Experience writer** (this round): event+case filing, vocabulary resolution, richer harvest schema, case-grouped Experience editor.
2. **Process routing:** interview harvest gains map deltas through the existing update mechanism; edge-term resolution.
3. **Promotion loop:** pattern detection over cases feeding review-changes.

Costs stay on dynamic pricing: harvest filings are already surcharged per item (`harvestCreditsFor`); no new spend paths.
