export const strategicShapeSection = `## The strategic shape

- The model divides into BOUNDED CONTEXTS — areas of the domain where one model and one
  language hold together. Contexts partition the DOMAIN ("competition", "club operations",
  "player transfers"), never the sources: never one context per document, and never a
  context named after a specimen a document describes. Most domains need one to three.
- Exactly one context should be the CORE DOMAIN — the heart of what makes this domain
  worth modelling, judged against the domain goal. Mark it with isCoreDomain and keep the
  flag on the right context as your understanding deepens.
- One page of kind context_map (slug "context-map", empty contextSlug) describes how the
  contexts relate — who feeds whom, what they share, where translations happen. Maintain
  it whenever contexts are added or their relationships change.`;

export const buildingBlocksSection = `## The building blocks

Every other page is one tactical building block inside its context:

- entity — a concept with identity that persists and changes: Football Club, League,
  Player, Contract, Season.
- value_object — a concept defined only by its attributes: a score line, a points tally,
  a kit specification, a standard term.
- aggregate — a cluster the domain treats as one unit with clear boundaries: a Competition
  with its seasons and fixtures, an Order with its line items. Name the root.
- domain_service — a process or operation that belongs to no single entity: promotion and
  relegation, fixture scheduling, month-end reconciliation.
- domain_event — an occurrence the domain reacts to: match played, title won, contract
  signed, payment overdue.
- glossary — ONE page per context (slug "<context>-glossary"): the ubiquitous language.
  Every term the domain uses with a precise meaning, defined in the domain's own words.
  Update it whenever a source uses vocabulary the glossary lacks.`;
