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
  or by adding a note — typed, dictated with the phone keyboard's microphone, or pasted
  from a voice memo transcript. Browse every page, item and task across the brains, search
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
  [docs/mcp-architecture.md](./docs/mcp-architecture.md) the design.
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
| `RESEND_API_KEY` / `EMAIL_FROM` | Resend API key and sender address for transactional email — optional, sending is skipped without them |

## Architecture

The agent roadmap — interviewer, cartographer, surveyor, planner — lives in
[docs/agent-architecture.md](./docs/agent-architecture.md). `npm run benchmark` measures the
four brains against the raw documents; [docs/benchmark.md](./docs/benchmark.md) says how.

## Stack

SvelteKit, Svelte 5, Tailwind CSS 4, TypeScript, Supabase (Auth + Postgres), Claude API.

All code follows the conventions in [CLAUDE.md](./CLAUDE.md).
