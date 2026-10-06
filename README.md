# Your Brain Today (YBT)

Knowledge Bases that hold what a business knows, has done, and how it works, so that
people and AI can ask them.

## Status

Early access. Accounts, credits, Knowledge Bases, chatbots, the marketplace and the
MCP server are working:

- Sign in with Google, or with an email address and a password — new accounts confirm
  their address by email and start with zero credits; [docs/auth-setup.md](./docs/auth-setup.md)
  covers the provider configuration.
- Buy credit packs at `/account/credits` — live Stripe Checkout with webhook fulfilment
  when keys are set, a placeholder otherwise; [docs/stripe-setup.md](./docs/stripe-setup.md)
  covers the keys and the unit economics.
- Build a Knowledge Base at `/knowledge-base` — one dashboard per base, with a header
  switcher between bases, and four brains per base: expertise (what the business knows,
  as a domain model), experience (what it has done, as case files), process (how it
  works, as flows of work) and human (who it knows, as a network of people and how well
  they get on). Each is built by interview with an agent, by uploading the documents
  the business already files — several at once, each read in four stages that resume
  where they stopped ([docs/source-reading-architecture.md](./docs/source-reading-architecture.md)) —
  or by quick capture — one box that takes whatever was just forwarded: a link to a
  GitHub repository, an X profile or post or any web page is fetched and read
  ([docs/link-ingestion-architecture.md](./docs/link-ingestion-architecture.md)); a
  pasted post, message or voice memo transcript, or a note typed or dictated with the
  phone keyboard's microphone, is kept word for word; a pasted screenshot is read as an
  image. Browse every page, item and task across the brains, search
  their bodies, and read any page with its backlinks at `/knowledge-base/{id}/browse`
  ([docs/knowledge-explorer-architecture.md](./docs/knowledge-explorer-architecture.md)).
  Every answer is grounded in pages the model actually read, with citations. Asked from
  outside, the four brains answer as one through the orchestrator, which searches and
  reads in rounds;
  [docs/domain-brain-architecture.md](./docs/domain-brain-architecture.md),
  [docs/process-brain-architecture.md](./docs/process-brain-architecture.md),
  [docs/human-brain-architecture.md](./docs/human-brain-architecture.md) and
  [docs/orchestrator-architecture.md](./docs/orchestrator-architecture.md) cover the design.
- Hand a chatbot to staff at `/chatbots` — the first tool built on a Knowledge Base. A
  manager names a bot on their base, invites members by email, funds it from their own
  credits and sets each member's allowance; members ask, and never open the base itself.
  Every question is kept on the bot's record for the manager — who asked, when, what it
  answered — with a CSV to hand over, and the manager can set the answer they would rather
  it gave; [docs/chatbot-architecture.md](./docs/chatbot-architecture.md) is the design.
- Sell a brain at `/market` — publish an edition or a subscription, and buyers read it
  with their own credits.
- Ask the Hive Mind at `/hive-mind` — approved brains answer across specialities and
  their owners earn from the questions.
- Connect your own Claude through the MCP server at `/api/mcp` — OAuth sign-in from the
  Connect button; it reads the four brains of every knowledge base you own, searches them
  by words, asks them, and sends data in to train them. Asked, the orchestrator searches
  and reads in up to three rounds and cites only the pages it read. The public API under
  `/api/v1` lets other software read a knowledge base, search it, ask it, read its pages
  and export it;
  [docs/connect-claude.md](./docs/connect-claude.md) is the walkthrough and
  [docs/mcp-architecture.md](./docs/mcp-architecture.md) the design. With Anthropic's
  Microsoft 365 connector switched on beside it, Claude reads your mail, SharePoint and
  Teams and files what matters into the brain;
  [docs/connect-microsoft-365.md](./docs/connect-microsoft-365.md) is that walkthrough.
- Admins (`/admin`) can set the site model — the Claude model behind every agent reply —
  grant promotional credits, restrict accounts, and delete accounts. The first admin is
  bootstrapped by email on signup.

The agents use the Claude API when `ANTHROPIC_API_KEY` is set, and fall back to a scripted
interviewer when it is not.

The consultancy that sells and implements this — projects, clients, support, accounting —
lives separately in [YourBusinessToday](https://github.com/jamesbeadle/YourBusinessToday).

## Running locally

```bash
npm install
cp .env.example .env   # fill in the values below
npm run dev
```

| Variable | Purpose |
| --- | --- |
| `PUBLIC_SUPABASE_URL` | Supabase project URL |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable API key |
| `ANTHROPIC_API_KEY` | Claude API key — optional, scripted agent without it |
| `STRIPE_SECRET_KEY` | Stripe secret key — optional, placeholder checkout without it |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for `/api/stripe-webhook` |
| `SUPABASE_SECRET_KEY` | Supabase secret key — used by the Stripe webhook, the MCP server and to read the site model |
| `GITHUB_TOKEN` | GitHub token — optional, lets links to private repositories be read and lifts GitHub's rate limit |
| `RESEND_API_KEY` / `EMAIL_FROM` | Resend API key and sender address for transactional email — optional, sending is skipped without them |

## Architecture

The agent roadmap — interviewer, cartographer, surveyor, planner — lives in
[docs/agent-architecture.md](./docs/agent-architecture.md). `npm run benchmark` measures the
four brains against the raw documents; [docs/benchmark.md](./docs/benchmark.md) says how.

## Stack

SvelteKit, Svelte 5, Tailwind CSS 4, TypeScript, Supabase (Auth + Postgres), Claude API.

All code follows the conventions in [CLAUDE.md](./CLAUDE.md).

<!-- code-quality:start -->
## Code quality

<table><tr><td align="center">
<strong>Code quality score</strong><h2>83.3%</h2>
<sub>measured 2026-10-06 · project-process kit 1.14.0</sub>
</td></tr></table>

1,383 files · frontend 505 · backend 457 · tooling 105 · shared 98 · api 64 · database 60 · tests 40 · docs 40 · infrastructure 14

<details>
<summary><strong>How the 83.3% is made up</strong></summary>

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **93.4%** | **60** | |
| Files over the line limit | 0 in 1150 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 59 in 1727 functions | 86.3% | 8 | 25% of functions |
| Else blocks | 1 in 1833 branches | 99.9% | 5 | 50% of branches |
| Duplication % | 0.25 | 98.8% | 8 | 20 |
| Explanatory comment lines | 259 in 46.37 thousand lines | 88.8% | 4 | 50 per thousand lines |
| Inline magic values | 36 in 46.37 thousand lines | 96.1% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 1965 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 435 in 46.37 thousand lines | 68.7% | 4 | 30 per thousand lines |
| Deeply indented lines | 284 in 46.37 thousand lines | 79.6% | 4 | 30 per thousand lines |
| Overlong function names | 4 in 1727 functions | 97.7% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 77 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **78.0%** | **20** | |
| Conditions with calls tangled inside calls | 50 in 1833 branches | 89.1% | 8 | 25% of branches |
| Conditions compared to a raw literal | 251 in 1833 branches | 45.2% | 6 | 25% of branches |
| Accessor names that want to be a property | 7 in 1727 functions | 95.9% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **0.0%** | **8** | |
| Doors that write without checking their input against the columns | 58 in 58 write doors | 0.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

</details>

<details>
<summary><strong>The repository by area: 1,383 files</strong></summary>

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| frontend | 505 | 492 | 22,709 |
| backend | 457 | 457 | 16,004 |
| tooling | 105 | 0 | 0 |
| shared | 98 | 97 | 3,406 |
| api | 64 | 64 | 2,519 |
| database | 60 | 0 | 0 |
| tests | 40 | 40 | 1,728 |
| docs | 40 | 0 | 0 |
| infrastructure | 14 | 0 | 0 |
| **whole repository** | **1,383** | **1,150** | **46,366** |

</details>

<details>
<summary><strong>The refactoring plan: 13 steps, in order</strong></summary>

**Pass 4 — Design pattern identification**

1. Complete the pattern: every +page.server.ts has a +page.svelte. 7 of 37 lack it. Predicted: src/routes/hive-mind/+page.svelte; src/routes/knowledge/+page.svelte; src/routes/knowledge-base/+page.svelte; src/routes/knowledge-base/[knowledgeBaseId=uuid]/brains/new/+page.svelte. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.
2. Complete the pattern: every +page.svelte has a +page.server.ts. 5 of 35 lack it. Predicted: src/routes/+page.server.ts; src/routes/contact/+page.server.ts; src/routes/privacy/+page.server.ts; src/routes/terms/+page.server.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.

**Pass 5 — The sweep to zero**

3. Conditions compared to a raw literal: 251 to zero. Scores 45.2% at weight 6; the offenders are in audit.json under details.conditions, fifty at a time.
4. Long member chain lines: 435 to zero. Scores 68.7% at weight 4; the offenders are in audit.json under details.prose, fifty at a time.
5. Deeply indented lines: 284 to zero. Scores 79.6% at weight 4; the offenders are in audit.json under details.prose, fifty at a time.
6. Functions over the line limit: 59 to zero. Scores 86.3% at weight 8; the offenders are in audit.json under details.functionShape, fifty at a time.
7. Explanatory comment lines: 259 to zero. Scores 88.8% at weight 4; the offenders are in audit.json under details.comments, fifty at a time.
8. Conditions with calls tangled inside calls: 50 to zero. Scores 89.1% at weight 8; the offenders are in audit.json under details.conditions, fifty at a time.
9. Accessor names that want to be a property: 7 to zero. Scores 95.9% at weight 6; the offenders are in audit.json under details.accessorNames, fifty at a time.
10. Inline magic values: 36 to zero. Scores 96.1% at weight 4; the offenders are in audit.json under details.magicValues, fifty at a time.

… and 3 more steps. The whole plan, with the measured detail, is in [`tools/refactor/refactor-plan.md`](tools/refactor/refactor-plan.md).

</details>

<!-- code-quality:end -->
