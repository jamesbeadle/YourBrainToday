# The Interview — Architecture

How the Interviewer stops being a prompt that hopes and becomes an engine that knows: what
a complete picture of any business looks like, what is missing from this one, and therefore
what to ask next.

## The idea in one sentence

The interview is a search for a complete Workflow Model; the state of the search is derived
from the map itself on every turn, never stored, so the map remains the single source of
truth and the question engine can never drift from it.

## The universal structure

Every business, whatever it sells, reduces to the same shape:

- **External parties** exchange things with the business — customers, suppliers, regulators.
- **Roles** are the hats people wear, official or not. A role performs **tasks**.
- A task **transforms inputs into outputs**. That is all a task is.
- An output either **feeds another task** (a handover, when the consumer is a different
  role — an interchange on the map) or **leaves the business** (a business output).
- An input either **comes from another task's output** or **enters from outside** (an
  external input: a customer enquiry, a supplier invoice, a site survey).
- A **journey** is the chain from an external input to a business output. Journeys are not
  stored — they are traced by matching outputs to inputs by name. Derive what's derivable.

This gives completeness a definition. A Workflow Model is complete when five axioms hold:

1. **Every input has a source** — produced by some task, or listed as an external input.
2. **Every output has a destination** — consumed by some task, or marked a business output.
3. **Every interchange has a failure note** — handovers are where businesses leak time and
   money; an interchange whose failure mode is unknown is unexamined, not healthy.
4. **Every business output terminates a traceable journey** — you can walk backwards from
   it to an external input without falling off the map.
5. **Every fact is stated or confirmed** — anything the agent inferred must be put back to
   the owner before it counts.

A **gap** is a violation of an axiom. The set of gap types is finite, and each gap type has
a question archetype. This is the whole trick: *the question space is the gap taxonomy*.
The agent never wonders what to ask; the model's incompleteness tells it.

## Model extensions

Each addition is demanded by something the UI shows or the axioms need — nothing
speculative.

```
WorkflowTask
  name, summary, inputs, outputs          (unchanged)
  handovers: { toRole, failureNote? }[]   (replaces handoverRoles — axiom 3 needs the note;
                                           StationDetailPanel shows it on the interchange)
  businessOutput?                         (unchanged)
  provenance: 'stated' | 'inferred'       (axiom 5; the map draws inferred stations dashed
                                           until confirmed)

WorkflowModel
  businessName, roles                     (unchanged)
  externalInputs: string[]                (axiom 1 needs somewhere for outside-world
                                           arrivals to live; journeys start here)
```

**Deviation from docs/agent-architecture.md, named explicitly:** that doc lists Journey as
part of the stored model. Journeys are fully derivable from output→input name matching, so
storing them would duplicate truth. They become a `traceJourneys(model)` function instead.

**Vocabulary discipline makes edges real.** Name-matching only works if the same artefact
is written identically everywhere. The agent controls both ends of every edge, so the
prompt gains one hard rule: when a task consumes another task's output, write the input
using the identical phrase. Strings become edges; the map becomes a graph.

## The interview engine

Code computes, the model asks. Every turn:

```
map ──► deriveInterviewState ──► { phase, rankedGaps }
                                        │
                          agenda rendered into system prompt
                                        │
                     Claude phrases ONE question, in the owner's words
                                        │
                     reply + updated map ──► next turn re-derives
```

### Phases, derived not stored

The phase is the first of these whose exit criteria fail — a pure function of the map:

| Phase | Exit criteria |
| --- | --- |
| **Foundation** | businessName set, at least one external input, at least one role |
| **Roles** | no role with fewer than two tasks; owner asked "what other hats?" (satisfied once every role has tasks) |
| **Flow** | every task has at least one input and one output |
| **Connection** | axioms 1 and 2 hold — no orphan inputs, no dead-end outputs |
| **Interchanges** | axiom 3 holds — every handover has a failure note |
| **Resolution** | axiom 5 holds — nothing left marked inferred |
| **Complete** | all of the above; axiom 4 follows automatically |

### The gap taxonomy

| Gap | Axiom | Question archetype |
| --- | --- | --- |
| UnnamedBusiness | — | "What does the business do, and for whom?" |
| NoExternalInputs | 1 | "What arrives from the outside world that starts work off?" |
| LonelyRole | — | "What else does <role> handle in a normal week?" |
| BareTask | flow | "Walk me through <task> — what must exist before it starts? What comes out?" |
| OrphanInput | 1 | "<task> needs <input> — where does that come from?" |
| DeadEndOutput | 2 | "<task> produces <output> — who picks that up next?" |
| SilentInterchange | 3 | "When <role A> hands <output> to <role B>, what goes wrong or gets delayed?" |
| BrokenJourney | 4 | "I can't trace <business output> back to where it starts — what am I missing?" |
| InferredFact | 5 | "I've assumed <fact> — did I get that right?" |

### Ranking

Phase first: gaps belonging to the current phase outrank all others. Within a phase, gaps
that block a business-output trace outrank gaps that don't — the journeys the customer
gets paid for are mapped before the housekeeping. Ties break by role, so questioning stays
on one line rather than jumping around the map.

### The agenda, not a script

The rendered agenda gives Claude the current phase, the top gap with its archetype, and the
next two gaps as alternates. The archetype is a target, not a script — Claude phrases it in
the owner's own vocabulary, and if the owner's answer opens a richer seam (a new role, a
war story about a handover), Claude follows the energy and captures everything said. The
engine doesn't mind: whatever lands in the map changes the derived state, and the agenda
self-corrects next turn. Control without rigidity.

## Files

All new logic is pure functions on the model — testable with fixtures, no API calls.

```
src/lib/data/workflowModel.ts                        extended types (edited)
src/lib/server/agent/interview/traceJourneys.ts      output→input edges, journey walking
src/lib/server/agent/interview/findGaps.ts           the taxonomy, one detector per gap
src/lib/server/agent/interview/derivePhase.ts        exit criteria checks
src/lib/server/agent/interview/rankGaps.ts           the ranking rules
src/lib/server/agent/interview/renderAgenda.ts       state → prompt section
src/lib/server/agent/deriveInterviewState.ts         composes the above
```

`replyFromAgent` changes one line of shape: the system prompt becomes
`agentSystemPrompt + renderAgenda(deriveInterviewState(currentMap)) + currentMap`. The
scripted fallback is untouched.

## Migration notes

- `handoverRoles: string[]` → `handovers: { toRole, failureNote? }[]` ripples through
  `workspaceUpdateTool` (schema), `parseWorkflowModel`, and `stationBuilder` (which reads
  handovers to mark interchanges).
- `provenance` and `externalInputs` are additive; `parseWorkflowModel` defaults them
  (`'stated'`, `[]`) so existing stored maps load unchanged.
- The dashed rendering of inferred stations is a follow-up UI task, not part of this
  change; the model carries the field from day one so no second migration is needed.
