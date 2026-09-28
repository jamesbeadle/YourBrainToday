# The MCP Server — Architecture

One endpoint, `/api/mcp`, that lets a person's own Claude reach their knowledge bases
without a browser, a token to paste, or a login prompt in the middle of their work. Their
Claude sees the four brains of every knowledge base they own, reads them, asks them, and
sends what it learns back in — so the business's memory is in the conversation while the
data stays where it is owned.

It adds no domain. Every action here is a second face on a command or query the site
already runs. If an action needs something the site does not define, the domain is wrong —
fix it there, not here.

## The stories it serves

| As | I want | So that |
| --- | --- | --- |
| Owner | to press Connect in Claude and arrive as myself | there is no token to copy and nothing to paste |
| Owner | Claude to know which knowledge bases I own and what each of their four brains holds | it aims at the right brain before it reads or asks |
| Owner | to ask a knowledge base from inside Claude and get one answer drawn from whichever brains hold it | my business's memory is in the conversation without moving my data to anyone |
| Owner | to ask one brain alone — expertise, experience, process or human | I pull exactly the kind of knowledge I need |
| Owner | Claude to read the brains itself — the index, the pages, the entries, the map, the people — for nothing | Claude reasons over the raw knowledge and I pay only for answers |
| Owner | to send Claude's notes and findings in to train the brains | the knowledge base grows from the work, not only from uploads |

## The shape: four tools, many actions

Claude sees four tools, the same four for everyone:

| Tool | What it does |
| --- | --- |
| `get_current_context` | who the signed-in person is, their standing, and the areas they can reach |
| `list_actions` | every action this person may run, one line each, optionally narrowed to an area |
| `describe_action` | one action in full — its input schema and any doctrine attached to it |
| `perform_action` | run one action by name with its input |

The actions live in `src/lib/server/mcp/actions/`, one file per concern, gathered by area
into `actionRegistry.ts`:

| Area | Action | Costs | What it does |
| --- | --- | --- | --- |
| `account` | `who_am_i` | — | email and standing |
| `knowledge-bases` | `list_knowledge_bases` | — | every knowledge base the caller owns, with its id |
| `knowledge-bases` | `ingest_data` | as an upload | sends text in to train a knowledge base's brains |
| `brains` | `describe_knowledge_base` | — | the four brains of one knowledge base: what each answers and how much it holds |
| `brains` | `read_expertise_index` | — | every bounded context and page of the expertise brain, a line each, keyed `brain-handle/page-slug` |
| `brains` | `read_expertise_pages` | — | the full bodies of up to ten pages, by key |
| `brains` | `read_experience` | — | the experience brain, newest entries first |
| `brains` | `read_process_map` | — | the process brain: roles, tasks, handovers and journeys |
| `brains` | `read_people` | — | the human brain: the people and how well each pair gets on |
| `brains` | `ask_knowledge_base` | a question | the orchestrator answers from whichever of the four brains hold it |
| `brains` | `ask_brain` | a question | the orchestrator answers from one brain alone |

Every `brains` action takes `knowledge_base_id` and runs through `onOwnedKnowledgeBase`,
which refuses any id that is not an unarchived knowledge base of the caller's — the row
does not exist for them. The read actions render the brains exactly as the orchestrator
sees them (`src/lib/server/knowledge/reading/`) and cost nothing: no Claude call is made
on the server. The ask actions run the orchestrator
([orchestrator-architecture.md](./orchestrator-architecture.md)) and spend the owner's
credits as a question on the site does — the site model's floor reserved first, the
marked-up bill settled after, the reserve refunded if the answer fails — and record the
exchange in the primary expertise brain's log with `askedThrough: 'mcp'`.

Each action names its audience — `everyone`, `owner` or `admin` — and the registry
filters by the caller's standing on every lookup. This shape keeps the tool list small and
stable while the site grows: adding a capability is adding an action file, never a tool.
Tool descriptions are prose the caller's Claude reads, so they name the domain plainly.

Every action runs against the service-role Supabase client, so row-level security is
not the gate here — the action code is. The caller's account comes from the token, never
from input, and every action that touches a knowledge base checks its ownership itself.

## The route

```
src/routes/api/mcp/+server.ts               POST — the whole protocol surface
src/lib/server/mcp/readMcpRequest.ts        parse one JSON-RPC message
src/lib/server/mcp/mcpMethods.ts            initialize | ping | tools/list | tools/call
src/lib/server/mcp/mcpProtocol.ts           supported revisions and server identity
src/lib/server/mcp/mcpTools.ts              the four tools
src/lib/server/mcp/actionRegistry.ts        every action, filtered by standing
src/lib/server/mcp/actions/*.ts             one file per concern
src/lib/server/mcp/resolveMcpCaller.ts      the gate
src/lib/server/mcp/toolFailureSentence.ts   database failures as sentences the model can act on
src/lib/server/mcp/mcpErrors.ts             JSON-RPC error codes as named constants
```

Streamable HTTP, JSON responses only — no SSE, no session id, no server-initiated
messages. Nothing here streams or pushes, so the stateless shape is the honest one and it
survives Vercel's serverless model without a session store. Each POST carries one
JSON-RPC message and gets one JSON reply; a notification gets 202 and no body.

A failure inside an action is answered as a tool result with `isError`, in a sentence:
a malformed id says so, a missing referent says so, and only a real fault says "try
again shortly" — a refusal the model can read beats an error it will retry.

## Authentication

OAuth 2.1, the way Claude's own connectors work, resolved by `resolveMcpCaller`. The
server publishes `/.well-known/oauth-authorization-server` and
`/.well-known/oauth-protected-resource/api/mcp`; an unauthenticated call gets 401 with a
`WWW-Authenticate` header pointing at them. Clients register themselves at
`/oauth/register` (RFC 7591), send the person to `/oauth/authorize` where they sign in as
usual and press Connect, and exchange the code at `/oauth/token` with PKCE (S256,
required). Access tokens (`ybt_at_`, one hour) and refresh tokens (`ybt_rt_`, sixty days)
are opaque and SHA-256 hashed at rest, like every secret in this database. A confidential
client's secret is verified at the token endpoint; a public client is bound by PKCE alone.
Codes are single-use by construction — claiming one is a single conditional update. A
restricted account's tokens stop working the day the account is restricted.

The token endpoint is called server-to-server with no `Origin` header, which SvelteKit's
own form-origin check would refuse. That check is therefore off in `svelte.config.js` and
re-implemented in `hooks.server.ts` through `src/lib/server/http/crossSiteFormSubmission.ts`,
which exempts exactly that one path and keeps every other form as protected as it was.

[connect-claude.md](./connect-claude.md) is the walk-through for a person connecting
Claude.ai, Claude Desktop or Claude Code.

## Reading and asking from outside: MCP and REST

Two doors onto the same readers and the same orchestrator, so anything that holds an
OAuth connection or a brain API token reaches the same knowledge:

| Over MCP | Over REST (`Authorization: Bearer <brain API token>`) |
| --- | --- |
| `describe_knowledge_base` and the `read_` actions | `GET /api/v1/knowledge-bases/{id}` — the four brains as JSON, plus the same markdown the orchestrator reads; `?brains=process,human` narrows it |
| `read_expertise_pages` | `GET /api/v1/brains/{brainId}/pages/{slug}` |
| `ask_knowledge_base`, `ask_brain` | `POST /api/v1/knowledge-bases/{id}/ask` with `{"question", "brains"?}` |
| `ingest_data` | `POST /api/v1/brains/{brainId}/ingest` with `{"title", "text"}` |

A brain API token is minted on the knowledge base dashboard for its primary expertise
brain; the knowledge-base routes accept it for the knowledge base that brain is filed in
(`resolveKnowledgeBaseApiCaller`). The owner pays for questions and ingests on either
door; reading is free on both.

## Training a brain from outside

Two doors onto one path, `src/lib/server/brain/sentData/ingestSentData.ts`:

- **MCP** — `list_knowledge_bases`, then `ingest_data` with a knowledge base id, a title
  and the text.
- **REST** — `POST /api/v1/brains/{id}/ingest` with `{"title", "text"}` and a brain API token.

Sent text is filed as a `brain_sources` row exactly like an upload, marked with
`arrived_through` (`mcp` or `api`, migration 0054), and read by `runSourceIngest`, so the
expertise model updates and the experience, process and human brains harvest from it. It
shows in the knowledge base's **Ingested data** panel with a "Sent over MCP" / "Sent
through the API" label. The owner pays as for an upload of that size: the reserve is taken
server-side through `reserveCreditsForPayer` (handed straight back if it would take the
balance below zero) and settled beyond it under `brain_ingest_sent`.

## Known gaps, in order

- Only an owner reaches a knowledge base over MCP; a viewer it is shared with (`kb_shares`)
  is told it does not exist. Sharing a brain into someone else's Claude is the next story.
- `/oauth/register` is unauthenticated and unrated; anyone can fill `oauth_clients`. Cap it
  per IP or gate it behind an initial access token before the URL is widely public.
- There is no page where a person sees and revokes their connections; the row-level
  policies in 0038 are ready for one.
- Actions do not validate their input against `inputSchema` before running; a bad id is
  caught by the ownership check or the database and reported honestly, but a read-and-refuse
  in the action would read better.
- The experience, process and human brains are printed under the caps in
  `knowledgeReadingCaps.ts` rather than searched, so a large experience log shows only its
  newest entries. Retrieval over items is the natural next step.
