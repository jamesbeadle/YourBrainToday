# The Process Brain — Architecture

How the third brain is understood, filled, and drawn — with the same rigour that domain-driven
design gives the Expertise brain and case-based reasoning gives the Experience brain.

## One sentence each

- **Expertise** is a *model of concepts*: bounded contexts, entities, value objects, the
  ubiquitous language — Evans' domain-driven design. It answers "what do you know?"
- **Experience** is a *record of specimens*: episodes grouped into case files — Kolodner's
  case-based reasoning. It answers "what have you done?"
- **Process** is a *model of flow*: tokens of work moving through tasks along handovers —
  Petri's token-flow nets and Lean value-stream mapping, joined at every handover by Evans'
  context map. It answers "how do you work?"

The three are not three views of one model. They are three different kinds of knowledge with
three different completeness tests, and a document filed into the knowledge base is read
three times, once by each brain's reader.

## The token-flow model

The Process brain keeps a Workflow Model (`src/lib/data/workflowModel.ts`). Read as a
token-flow net it has exactly these parts:

| Part | In the model | In Petri / value-stream terms | In the brain drawing |
| --- | --- | --- | --- |
| Role | `roles[].name` | a lane; a bounded context of work | a coloured territory of cortex |
| Task | `roles[].tasks[]` | a transition — inputs in, outputs out | a station: a neuron |
| Artefact | `inputs[]`, `outputs[]` | a token type — enquiry, quote, drawing, invoice | a pulse travelling a fibre |
| Edge | output name = input name | an arc; strings are edges | a tapered fibre between stations |
| Handover | `handovers[].toRole` | an interchange between lanes; a context-map relationship | a synapse — a bright junction where the pulse crosses lanes |
| Failure note | `handovers[].failureNote` | the waste at the interchange (Lean's seven wastes live here) | the synapse's caption |
| External input | `externalInputs[]` | a source; the outside world's token | a sensory root at the front of the brain |
| Business output | `task.businessOutput` | a sink; what a customer, supplier, or regulator receives | a motor root at the back |
| Journey | derived, never stored | one token's path from source to sink | one pulse's whole trip |
| Provenance | `stated` / `inferred` | a confirmed vs assumed transition | a bright vs dim station |

Two rules make the model a graph rather than a list. **Vocabulary discipline**: when a task
consumes another task's output, the input is written with the identical phrase, so name
matching yields the edges. **Derive what is derivable**: journeys, gaps, phases, and the
drawing are all computed from the model on demand; nothing about them is stored.

## Completeness: the five axioms

A Workflow Model is complete when (`docs/interview-architecture.md`):

1. every input has a source — a producing task or an external input;
2. every output has a destination — a consuming task or a business output;
3. every handover has a failure note;
4. every business output terminates a journey traceable back to an external input;
5. every fact is stated or confirmed.

Each violation is a gap with a question archetype; the interview is a search that closes
gaps. The brain drawing shows the same gaps physically: an output nobody consumes trails off
into the dark as a stub, an input nobody produces arrives from nowhere, an inferred station
sits dim until the owner confirms it. The map looks unfinished exactly where it is.

## Handovers as a context map

Roles are bounded contexts of work, and a handover is where one context's artefact becomes
another's input. Evans' context-map relationships name what happens at that boundary —
customer/supplier, conformist, anti-corruption layer, published language — and every one of
them is a place where meaning gets translated, delayed, or lost. That is why axiom 3 insists
on a failure note for every handover, and why the drawing gives handovers a synapse: a
visible gap the pulse has to jump, with the failure mode written on it. Everything inside a
lane flows; everything between lanes is a negotiation.

## How documents fill it

A source document filed into the knowledge base is read by three readers in one ingest
(`src/lib/server/brain/runSourceIngest.ts` → `routeSourceToBrains.ts`):

- **The Modeller** reads for expertise — concepts, never specimens — and updates the
  domain model.
- **The Archivist** reads for experience — specimens, never rules — and files past-tense
  episodes into case files in the Experience brain (`harvestSourceExperience.ts`).
- **The Cartographer** reads for flow — who does what, in what order, with which artefacts,
  and what goes wrong at the joins — and returns the complete updated Process Map
  (`mapSourceProcess.ts` → `updateProcessFromSource.ts`). Facts the document states are
  `stated`; anything the Cartographer concluded is `inferred`, and the interview puts it back
  to the owner.

Each reader is told that documents outside its kind are common and that returning nothing is
correct: a README has no experience and no flow; a job diary has both. The ingest never
invents work to fill a brain.

## The drawing: data travelling

The Process brain is drawn as a brain whose signals are the business's tokens
(`src/lib/components/brain/flow/`):

- **Sensory to motor.** External inputs root at the front of the brain, business outputs at
  the back. Every task is placed by how far along its journey it sits, so work literally
  moves front to back, the way a signal crosses a brain from sense to action.
- **Lanes are territories.** Each role owns a band of cortex across the brain, tinted with
  its own hue; its stations sit inside it. Handovers are fibres that cross from one hue into
  another and end in a synapse.
- **Pulses are tokens.** Comets are born at external inputs, travel each fibre, light every
  station they pass through, jump the synapses, and arrive at business outputs. Their
  colour is the lane they left. The traffic is the model animating itself: a station nothing
  ever reaches is a gap you can see.
- **Provenance is brightness.** Stated stations glow; inferred ones sit dim until confirmed.
- **Hover and click.** Hovering a station names the task, its role, inputs and outputs;
  hovering a synapse shows the failure note; clicking a station flies to it. The 2D transit
  map remains one panel away for editing.
