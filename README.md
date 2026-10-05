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
<strong>Code quality score</strong><h2>78.9%</h2>
<sub>measured 2026-10-04 · project-process kit 1.14.0</sub>
</td></tr></table>

1,394 files · frontend 516 · backend 468 · tooling 104 · shared 97 · api 64 · database 59 · docs 38 · tests 34 · infrastructure 14

<details>
<summary><strong>How the 78.9% is made up</strong></summary>

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **92.3%** | **60** | |
| Files over the line limit | 1 in 1165 files | 99.8% | 10 | 50% of files |
| Worst file, in limits over | 0.06 | 99.3% | 5 | 9 |
| Functions over the line limit | 60 in 1775 functions | 86.5% | 8 | 25% of functions |
| Else blocks | 1 in 1911 branches | 99.9% | 5 | 50% of branches |
| Duplication % | 0.25 | 98.8% | 8 | 20 |
| Explanatory comment lines | 263 in 47.45 thousand lines | 88.9% | 4 | 50 per thousand lines |
| Inline magic values | 36 in 47.45 thousand lines | 96.2% | 4 | 20 per thousand lines |
| Orphan components and functions | 32 in 2025 components and functions | 84.2% | 4 | 10% of components and functions |
| Long member chain lines | 449 in 47.45 thousand lines | 68.5% | 4 | 30 per thousand lines |
| Deeply indented lines | 287 in 47.45 thousand lines | 79.8% | 4 | 30 per thousand lines |
| Overlong function names | 4 in 1775 functions | 97.7% | 4 | 10% of functions |
| **Design pattern file count** | | **66.2%** | **10** | |
| Files the patterns predict but are missing | 13 in 77 predicted files | 66.2% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **76.7%** | **20** | |
| Conditions with calls tangled inside calls | 50 in 1911 branches | 89.5% | 8 | 25% of branches |
| Conditions compared to a raw literal | 278 in 1911 branches | 41.8% | 6 | 25% of branches |
| Accessor names that want to be a property | 10 in 1775 functions | 94.4% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **0.0%** | **8** | |
| Doors that write without checking their input against the columns | 58 in 58 write doors | 0.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

</details>

<details>
<summary><strong>The repository by area: 1,394 files</strong></summary>

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| frontend | 516 | 503 | 23,446 |
| backend | 468 | 468 | 16,319 |
| tooling | 104 | 0 | 0 |
| shared | 97 | 96 | 3,644 |
| api | 64 | 64 | 2,525 |
| database | 59 | 0 | 0 |
| docs | 38 | 0 | 0 |
| tests | 34 | 34 | 1,512 |
| infrastructure | 14 | 0 | 0 |
| **whole repository** | **1,394** | **1,165** | **47,446** |

</details>

<details>
<summary><strong>The refactoring plan: 16 steps, in order</strong></summary>

**Pass 3 — Utility function identification**

1. Remove the 32 components and functions nothing calls. Listed in audit.json under details.orphans and details.inventory.offenders.orphans; confirm each has no caller before it goes.

**Pass 4 — Design pattern identification**

2. Complete the pattern: every palette has a types. 1 of 5 lack it. Predicted: src/lib/components/face/reliefTypes.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.
3. Complete the pattern: every +page.server.ts has a +page.svelte. 7 of 37 lack it. Predicted: src/routes/hive-mind/+page.svelte; src/routes/knowledge/+page.svelte; src/routes/knowledge-base/+page.svelte; src/routes/knowledge-base/[knowledgeBaseId=uuid]/brains/new/+page.svelte. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.
4. Complete the pattern: every +page.svelte has a +page.server.ts. 5 of 35 lack it. Predicted: src/routes/+page.server.ts; src/routes/contact/+page.server.ts; src/routes/privacy/+page.server.ts; src/routes/terms/+page.server.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.
5. Divide `src/lib/data/brainTypes.ts` (106 lines) into the units its pattern names. 0 functions; the longest is 0 lines.

**Pass 5 — The sweep to zero**

6. Conditions compared to a raw literal: 278 to zero. Scores 41.8% at weight 6; the offenders are in audit.json under details.conditions, fifty at a time.
7. Long member chain lines: 449 to zero. Scores 68.5% at weight 4; the offenders are in audit.json under details.prose, fifty at a time.
8. Deeply indented lines: 287 to zero. Scores 79.8% at weight 4; the offenders are in audit.json under details.prose, fifty at a time.
9. Functions over the line limit: 60 to zero. Scores 86.5% at weight 8; the offenders are in audit.json under details.functionShape, fifty at a time.
10. Explanatory comment lines: 263 to zero. Scores 88.9% at weight 4; the offenders are in audit.json under details.comments, fifty at a time.

… and 6 more steps. The whole plan, with the measured detail, is in [`tools/refactor/refactor-plan.md`](tools/refactor/refactor-plan.md).

</details>

<!-- code-quality:end -->
