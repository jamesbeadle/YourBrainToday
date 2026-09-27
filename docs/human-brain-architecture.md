# The Human Brain — Architecture

How the fourth brain is understood, filled, and drawn — beside the Expertise brain (a model of
concepts), the Experience brain (a record of specimens) and the Process brain (a model of flow).

## One sentence

**Human** is a *network of people*: the people around a business as nodes, and every
relationship between two of them as an edge that knows what it is and how warm it runs —
social network analysis in the tradition of Granovetter's strong and weak ties. It answers
"who do you know?", and through that, "who should I go through?".

The same situation reads differently once you know the people in it. A variation order that
needs the client's sign-off is a rule (expertise), a story from the Hartley job (experience), a
handover from site to office (process) — and a question of whether to ask Sarah directly or
through Priya, who trusts your site manager and has not spoken to your estimator since.

## The model

A Human brain is a `kb_brains` row of category `people` and type `people_graph`
(`migrations/0052_human_brain.sql`). It needs no tables of its own:

| Part | Stored as | Holds |
| --- | --- | --- |
| Person | `kb_brain_items`, kind `person` | title = name; body = what is worth knowing; `data.role`, `data.organisation` |
| Connection | `kb_brain_items`, kind `connection` | title = the relationship ("works for", "fell out with"); body = the evidence; `data.from`, `data.to` (names); `data.warmth` |
| Organisation | derived, never stored | the people who share `data.organisation` |

**Warmth** is how well two people get on, on one scale (`src/lib/data/knowledge/humanConnections.ts`):
close, warm, neutral, cool, hostile. When a source says nothing about feeling the warmth is
neutral; it is never guessed. People are known by name, case-insensitively; a relationship
stated again between the same two people takes its latest warmth and evidence rather than
piling up, so the network tracks how people feel *now*.

## How it is filled

Every route in fills all four brains at once:

- **Documents.** A source filed into the knowledge base is read by four readers in one ingest
  (`routeSourceToBrains.ts`). After the Modeller has read it for expertise, the Archivist
  (experience), the Cartographer (process) and **the Connector** (people) read it side by side.
  The Connector (`harvestSourcePeople.ts` → `peopleHarvestPrompt.ts`) names the people, their
  roles and organisations, the relationships between them, and the warmth the document shows,
  and is told the names already known so the same person is not filed twice.
- **The interview.** Each turn harvests `people` and `connections` beside `expertiseFacts` and
  `experienceEvents` (`interviewAgent.ts`). The interviewer sees who is already known, and a
  focused Human interview asks who trusts whom, who has fallen out, and who to go through.
- **The process-map conversation.** The workspace agent harvests the same four kinds.
- **By hand.** The Contents panel lists people and relationships and adds either.

## How it is used

- **Ask.** The brain's own Ask panel reads every person and relationship with its warmth and
  is told to suggest a route through warm connections and warn of cool or hostile ones.
- **Chatbots.** Every chatbot reads the human brain beside the other three, so staff can ask
  "who should I speak to at Hartley Homes about this?".

## The drawing

The Human brain reuses the Expertise constellation (`humanConstellation.ts`): organisations
are lobes, people are neurons inside them, and every relationship is a fibre between two
people. Hovering names the person; clicking one opens their page — who they are, then
everyone they know, warmest first (`personPage.ts`).
