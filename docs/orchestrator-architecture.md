# The Orchestrator — Architecture

How one question is answered from the four brains of a knowledge base, and how that
answer reaches a person's own Claude, another agent, or a chatbot.

## One sentence

The orchestrator is the knowledge base speaking as one: it takes a question, works out
which of the four brains hold the answer, pulls what it needs from each in that brain's
own shape, and answers with citations that say which brain each part came from.

## Why four brains need an orchestrator

A document filed into a knowledge base is read four times (`runSourceIngest`, then
`routeSourceToBrains`): the Modeller updates the **expertise** model; the experience
reader files what happened as episodes and case files; the process mapper adds the tasks
and handovers it describes; the people reader adds who was in it and how they got on.
Four readings, because they are four kinds of knowledge with four shapes and four tests of
completeness ([domain-brain-architecture.md](./domain-brain-architecture.md),
[process-brain-architecture.md](./process-brain-architecture.md),
[human-brain-architecture.md](./human-brain-architecture.md)):

| Brain | Answers | Shape | How it is retrieved |
| --- | --- | --- | --- |
| Expertise | What do you know? | a domain model: bounded contexts of pages, a glossary | an index of every page, then the pages that could hold the answer, read in full |
| Experience | What have you done? | a log of episodes, grouped into case files | the newest entries, printed |
| Process | How do you work? | a token-flow net: roles, tasks, handovers, journeys | the latest map, printed with its journeys traced |
| Human | Who do you know? | a network: people and the warmth between them | the people and relationships, printed |

No single retrieval fits all four, and no single brain answers a real question. "Who signs
off a variation, and what happened last time we skipped it?" is a rule (expertise), a
handover (process), a story (experience) and a person to go through (human). The
orchestrator is where the four retrievals meet.

## The stories it serves

| As | I want | So that |
| --- | --- | --- |
| Owner | to ask my knowledge base one question and get one answer drawn from whichever brains hold it | I do not have to know which brain to ask |
| Owner | to ask one brain alone | I pull exactly the kind of knowledge I need |
| Owner | the answer to say which brains it drew on and which pages it read | I can check it, and see where the knowledge base is thin |
| Owner | my own Claude to ask through the orchestrator, or read the brains and orchestrate itself | my business's memory is in the conversation and my data stays where it is |
| Other software | the same through the API with a token | any agent can use the knowledge base |
| Chatbot member | the bot to answer from all four brains | I ask one thing and get the whole picture |

## The views

The orchestrator has no page of its own. It is reached through three doors, each already
a view:

```
Claude (any)  ──OAuth──▶ /api/mcp        ask_knowledge_base · ask_brain · read_* · describe_knowledge_base
Any agent     ──token──▶ /api/v1/knowledge-bases/{id}        GET (the four brains) · POST /ask
Chatbot member ─sign-in─▶ /chatbots/{id}  askChatbot — the same loop, with the bot's prompt and rulings
```

The knowledge base dashboard's own ask tools stay per brain (the expertise terminal, the
experience and human query panels): on the site a person chooses a brain by flying into
it, which *is* the orchestration.

## Data

Nothing new. A reading of a knowledge base is derived on every request from the four
brains as they stand, and never stored. An orchestrated answer asked from outside is
recorded as a `question_answered` event on the primary expertise brain's log, with the
question, the answer, the pages cited, the pages read, the brains consulted and
`askedThrough` (`mcp` or `api`) — the same log the dashboard shows.

## How it answers

`src/lib/server/orchestrator/askKnowledgeBase.ts`, five steps:

1. **Read** — `readKnowledgeBase(supabase, knowledgeBaseId, kinds)` reads the brains the
   question is put to, in parallel: all four by default, or one alone for `ask_brain`. A
   reading names its `kinds`, so everything downstream knows which brains are in play.
2. **Show** — `renderKnowledgeBase(reading)` renders one section per brain read: the
   expertise brains as an index (every page keyed `brain-handle/page-slug`), and the
   experience entries, the process map and the people in full, each under the caps in
   `knowledgeReadingCaps.ts` so the prompt stays bounded however large the knowledge base
   grows.
3. **Decide and pull** — `readThenAnswer` runs the exchange (`readingExchange.ts`). The
   system prompt (`orchestratorPrompt`) says which brain answers what and how each is in
   front of the model; the model must reply through a tool each round: `search_knowledge`
   when the index does not name what it needs (full-text search over every brain, hits
   keyed for `read_pages`), `read_pages` for the expertise pages it wants (ten per call), or
   the answer tool when the brains in front of it already answer. A round may hold several
   tool calls, all answered in one message (`answerReadingTools.ts`). After
   `mostReadingRounds` (three) the answer tool is forced, so the exchange always ends in an
   answer. Every page key that actually came back is tracked as `pagesRead`.
4. **Answer** — `orchestratorAnswerTool` requires `answerMarkdown`, `citedSlugs` (page
   keys) and `brainsConsulted` (kinds). `parseOrchestratedAnswer` keeps only kinds that were
   asked and only citations the exchange can vouch for — a page it read or one the index
   names (`honestCitations.ts`) — so an answer can never claim a brain it was not shown or
   a page it did not open. The answer carries `pagesRead` beside `citedPageKeys`.
5. **Record and settle** — `askKnowledgeBaseAndSettle` wraps the above for callers outside
   the site: the owner's rate is checked (`countRecentSpends`), the site model's floor is
   reserved from their ledger (`reserveCreditsForPayer`, reason `knowledge_base_question`),
   the answer is recorded, and the marked-up bill is settled beyond the reserve
   (`settleQuestionUsage`) — or the reserve is refunded when the answer fails. Nobody is
   signed in, so the site model answers; the owner's slider does not apply.

### Two layers of orchestration

The server's orchestrator is the one-shot answer. The caller's own Claude is the other
orchestrator: over MCP it can `describe_knowledge_base`, `read_expertise_index`,
`read_expertise_pages`, `search_knowledge_base`, `read_experience`, `read_process_map` and
`read_people` for nothing and reason over the raw knowledge itself, asking the server only when it wants the
knowledge base to answer in its own words. Both layers use the same readers and the same
renderers, so what Claude reads is exactly what the orchestrator is shown.

### The chatbot is the same loop

`askChatbot` runs `readThenAnswer` over a full reading with the bot's prompt
(`chatbotQueryPrompt`), its answer tool (which adds the knowledge-gap fields) and its
preferred answers appended ([chatbot-architecture.md](./chatbot-architecture.md)). One
loop, three prompts.

## Commands and queries

| Story | Query | Where it runs |
| --- | --- | --- |
| Ask the knowledge base | `AskKnowledgeBase(knowledgeBase, question, kinds)` | `askKnowledgeBase`; through `askKnowledgeBaseAndSettle` from `ask_knowledge_base` (MCP) and `POST /api/v1/knowledge-bases/{id}/ask` |
| Ask one brain | the same with `kinds = [brain]` | `ask_brain` (MCP); `"brains": ["process"]` on the API |
| Describe the brains | `DescribeKnowledgeBase(reading)` | `describeReading`; `describe_knowledge_base` (MCP), the `brains` field of `GET /api/v1/knowledge-bases/{id}` |
| Read a brain | `ReadKnowledgeBase(knowledgeBaseId, kinds)` + the renderer for that kind | the `read_*` actions (MCP); `GET /api/v1/knowledge-bases/{id}?brains=` |
| Read expertise pages | `FetchKeyedPages(brains, keys)` | `read_expertise_pages` (MCP); `GET /api/v1/brains/{brainId}/pages/{slug}` |
| Search the brains | `SearchKnowledgeBase(knowledgeBaseId, query)` | the `search_knowledge` tool inside the exchange; `search_knowledge_base` (MCP); `GET /api/v1/knowledge-bases/{id}/search?q=` |

The gates come first in every entry point: an MCP caller reaches only a knowledge base
they own (`onOwnedKnowledgeBase`); an API token reaches only the knowledge base its brain
is filed in (`resolveKnowledgeBaseApiCaller`); a member reaches only a bot they have joined
(the spend RPC). Every reader then runs on the service client, pinned to that knowledge
base id.

## Files

```
src/lib/server/knowledge/reading/
  readKnowledgeBase.ts        the reading, by kinds     renderKnowledgeBase.ts     one section per kind
  readExpertiseBrains.ts      contexts + index          renderExpertiseIndex.ts    keyed pages, per brain
  readExperienceEntries.ts    newest entries            renderExperienceEntries.ts
  readProcessMaps.ts          latest map per workflow   renderProcessMaps.ts       roles, tasks, journeys
  readPeople.ts               people + connections      renderPeople.ts            with warmth
  readExpertisePages.ts       fetchKeyedPages, renderKeyedPages, the tool result + keys read
  readThenAnswer.ts           the tools, then the loop  readingExchange.ts         up to mostReadingRounds, then the answer
  answerReadingTools.ts       one round's tool calls    searchKnowledgeTool.ts     search_knowledge over searchKnowledgeBase
  honestCitations.ts          keep only citable keys    readingTypes.ts            ReadingExchange, ReadingOutcome
  readBrainNames.ts           kb_brains id → name       describeReading.ts         what each brain holds
  clipPromptText.ts
src/lib/data/knowledge/knowledgeReadingCaps.ts        how much of each brain is shown
src/lib/server/orchestrator/
  askKnowledgeBase.ts         the orchestrator          orchestratorPrompt.ts      which brain answers what
  orchestratorAnswerTool.ts   + brainsConsulted         parseOrchestratedAnswer.ts (tested)
  askKnowledgeBaseAndSettle.ts  reserve → ask → record → settle | refund
  recordKnowledgeBaseQuestion.ts  the question_answered event
src/lib/server/mcp/actions/{brainReadActions,expertiseReadActions,searchActions,brainAskActions}.ts
src/lib/server/brainApi/{resolveApiToken,resolveKnowledgeBaseApiCaller,readKnowledgeKinds}.ts
src/routes/api/v1/knowledge-bases/[knowledgeBaseId=uuid]/{+server.ts,ask/+server.ts,search/+server.ts}
```

## Deliberate gaps

The experience, process and human brains are printed under caps, so a knowledge base with
more than 40 experience entries shows the orchestrator only its newest; `search_knowledge`
reaches the rest by words, but retrieval over items — by date, by case, by person — is
still the next step and the `retrieval_config` on every brain is where it will be
configured. Reading stops after three rounds, ten pages per call. Questions over MCP carry no conversation memory of their
own: the caller's Claude holds the conversation and asks whole questions; the expertise
API's `/ask` keeps threads by `conversationId` as before. A knowledge base shared with a
viewer is not yet reachable over MCP. The orchestrator answers on the site model, priced
at its floor; a per-token or per-brain price can follow once the usage table shows what a
four-brain question actually costs.
