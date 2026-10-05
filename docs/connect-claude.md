# Connect Claude to your brain

Your knowledge base is the memory Claude does not have: what your business knows, has
done, how it works and who it knows. Connect Claude to it and every conversation can draw
on that memory — and teach it — while the data stays in your account, yours to keep,
export or delete.

The connection is the MCP server at `https://yourbrain.today/api/mcp`
([mcp-architecture.md](./mcp-architecture.md)). It signs you in with the account you
already have; there is no key to copy.

## Claude.ai and the Claude desktop app

1. Open **Settings → Connectors** (on the web, or in the desktop app).
2. Choose **Add custom connector**. Name it *Your Brain Today* and give it the URL
   `https://yourbrain.today/api/mcp`.
3. Press **Connect**. Claude opens the Your Brain Today sign-in; sign in as usual and
   press **Connect** on the page that names the client.
4. In a chat, make sure the connector is switched on in the tools menu.

The connection lasts sixty days and renews itself while it is used. To end it, remove the
connector in Claude's settings.

## Claude Code

```bash
claude mcp add --transport http your-brain-today https://yourbrain.today/api/mcp
```

Then run `/mcp` inside Claude Code and choose *your-brain-today* to sign in. The same
connector works in every project.

## What to say to it

Claude starts by calling `get_current_context`, which tells it who you are and what it can
reach. From there, plain questions work:

- *"Which knowledge bases do I own?"* — `list_knowledge_bases`.
- *"What does the Jewel knowledge base hold?"* — `describe_knowledge_base`: the four brains
  and how much is in each.
- *"Ask my knowledge base who signs off a variation and what happened last time we skipped
  it."* — `ask_knowledge_base`: one answer, drawn from whichever brains hold it, naming the
  brains and citing the pages.
- *"Ask the process brain what happens after the quote goes out."* — `ask_brain`.
- *"Read the people brain and tell me who I should go through to reach the client."* —
  `read_people`, then Claude reasons over the network itself.
- *"File this meeting note into the Jewel knowledge base."* — `ingest_data`: the note is
  read like an uploaded document and all four brains learn from it.

Reading is free. Asking spends your credits as a question on the site does; sending data
in costs what an upload of that size costs.

## Everything it can do

| Action | Costs | What it does |
| --- | --- | --- |
| `who_am_i` | — | your email and standing |
| `list_knowledge_bases` | — | the knowledge bases you own, with their ids |
| `describe_knowledge_base` | — | the four brains of one knowledge base and how much each holds |
| `read_expertise_index` | — | every bounded context and page of the expertise brain |
| `read_expertise_pages` | — | the full bodies of up to ten pages |
| `search_knowledge_base` | — | every brain searched by words; page hits keyed for `read_expertise_pages` |
| `read_experience` | — | the experience brain, newest first |
| `read_process_map` | — | roles, tasks, handovers and journeys |
| `read_people` | — | the people and how well each pair gets on |
| `ask_knowledge_base` | a question | the orchestrator answers from whichever brains hold it |
| `ask_brain` | a question | the orchestrator answers from one brain alone |
| `ingest_data` | as an upload | sends text in to train the brains |

## Your mail, SharePoint and Teams

Switch on Anthropic's Microsoft 365 connector beside this one and Claude can read your
mailbox, SharePoint sites and Teams channels and file what matters into the brain with
`ingest_data`. [connect-microsoft-365.md](./connect-microsoft-365.md) is the walkthrough,
including what an administrator approves.

## Any other agent

Anything that can send a bearer token can use the same knowledge through the API. On the
knowledge base dashboard, open the **API** tool, create a token, and copy the briefing it
shows — it describes `GET /api/v1/knowledge-bases/{id}` (the four brains),
`POST /api/v1/knowledge-bases/{id}/ask`, the expertise brain's pages, `/ingest` and
`/export`. Questions and ingests spend the owner's credits; reading is free.

## What it reaches

A connected Claude reaches the knowledge bases you own and nothing else — not knowledge
bases shared with you, not anyone else's. Everything it asks is recorded in the knowledge
base's log, marked as asked over MCP, so you can always see what your Claude has been
asking.
