# YBT Agent Architecture

How the AI side of Your Brain Today should grow from today's single interviewer into the
system that draws, maintains, and eventually operates a customer's Workflow Map.

## The product in one sentence

A customer talks to an agent about how their business runs; YBT turns that conversation into
a living Workflow Map — every role a line, every task a station, every handover an
interchange — and then uses the map to automate the journeys that can run themselves.

## Design principles

The architecture follows the same rules as the codebase. Each agent has one job and a name
that says exactly what it does. Agents talk to each other through a single shared artefact —
the Workflow Map model — rather than through each other's internals. New capability arrives
as a new agent, not as a flag on an existing one.

## The shared artefact: the Workflow Map model

Everything pivots on one typed model, stored per company in Postgres:

- **Line** — a role, official or not (`role`, `colour`, `stations`)
- **Station** — a task (`name`, `inputs`, `outputs`, `producesOutput`)
- **Interchange** — a handover between two lines, with a `failureNote` for what goes wrong
- **Journey** — an ordered path of stations that delivers a business output end to end

The interview produces it, the renderer draws it, the automation planner reads it. It is the
single source of truth, and it is the contract between every agent below.

## Stage 1 — today: the Interviewer (shipped)

One agent, one conversation, ten credits per reply.

```
Browser ── /api/agent-chat ── gates (auth → credits → validation)
                                   │
                             Interviewer (Claude)
                                   │
                       agent_sessions / agent_messages
```

The Interviewer runs on a single system prompt: ask one question at a time, hunt for roles,
tasks, inputs, outputs, and handovers. Every turn is persisted, so the transcript is already
the raw material for stage 2. Credits meter the reply on a fine-grained scale — 10 credits
per reply — and every future agent prices its actions in the same currency without a
schema change.

## Stage 2 — the Cartographer: transcript → map

A second agent, run asynchronously after each session (or on demand for a 200-credit redraw):

```
agent_messages ──► Cartographer ──► workflow_map (versioned JSON) ──► TubeMap renderer
```

- **Extraction pass** — reads the full transcript and emits the Workflow Map model as
  structured output (tool-use / JSON schema, not prose).
- **Merge pass** — diffs the extraction against the current map version. New stations are
  added, renamed roles are reconciled, nothing is silently deleted; removals require the
  customer to confirm. Every redraw is a new version, so the map has history like a ledger.
- **Gap pass** — emits the questions the map cannot answer (a station with no inputs, a line
  with one station, an output that goes nowhere). These gaps are queued for the Interviewer,
  which is how the next conversation knows what to ask.

The Interviewer and the Cartographer never call each other. The transcript flows one way,
the gap queue flows back. Either can be improved, swapped, or re-run independently.

## Stage 3 — the Surveyor: many voices, one map

The credits page already promises teams. Each team member interviews separately; each
transcript goes through the same Cartographer; a Surveyor agent reconciles conflicting
accounts ("the PM says invoicing is finance's job; finance says it's the PM's") into either
a resolved merge or a flagged dispute on the interchange itself. Disputes are surfaced in
the UI on the exact station where they live — the map is the review interface.

## Stage 4 — the Planner and the Operators: automation

With inputs and outputs defined at every station, automation is a graph query, not a
guess:

- **Planner** — walks the map for journeys whose stations all have machine-readable inputs
  and outputs, and proposes them as automation candidates with an expected saving.
- **Operators** — one agent per automated journey, generated from the stations it serves.
  An Operator's tools are the integrations its stations demand (email, spreadsheet, CRM),
  and its definition of done is the journey's terminal output. Operators log every run as
  events against the stations they touched, so the map doesn't just describe the business —
  it shows the business running.

## Credit metering across stages

| Action | Credits |
| --- | --- |
| Agent reply (Interviewer) | 10 |
| Map redraw (Cartographer on demand) | 200 |
| Automation run (Operator journey) | priced per journey when stage 4 lands |

All spending stays in `credit_ledger` — one table, signed deltas, balance is the sum. New
agents add new `reason` values, never new billing mechanisms.

## Why this shape

Each stage ships value alone: the Interviewer is already a product, the Cartographer makes
it magical, the Surveyor makes it a team product, the Planner and Operators make it a
platform. No stage requires rework of the previous one, because the Workflow Map model is
the only coupling between them — and the map is also the UI, so every improvement an agent
makes is something the customer can literally see.
