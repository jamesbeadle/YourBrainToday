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
  switcher between bases, and three brains per base: expertise (what the business knows,
  as a domain model), experience (what it has done, as case files) and process (how it
  works, as flows of work). Each is built by interview with an agent or by uploading the
  documents the business already files, and every answer is grounded in those pages with
  citations; [docs/domain-brain-architecture.md](./docs/domain-brain-architecture.md) and
  [docs/process-brain-architecture.md](./docs/process-brain-architecture.md) cover the design.
- Hand a chatbot to staff at `/chatbots` — the first tool built on a Knowledge Base. A
  manager names a bot on their base, invites members by email, funds it from their own
  credits and sets each member's allowance; members ask, and never open the base itself;
  [docs/chatbot-architecture.md](./docs/chatbot-architecture.md) is the design.
- Sell a brain at `/market` — publish an edition or a subscription, and buyers read it
  with their own credits.
- Ask the Hive Mind at `/hive-mind` — approved brains answer across specialities and
  their owners earn from the questions.
- Connect your own Claude through the MCP server at `/api/mcp` — OAuth sign-in from the
  Connect button; the public API under `/api/v1` lets other software ask a brain, read
  its pages and export it; [docs/mcp-architecture.md](./docs/mcp-architecture.md) is the design.
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
[docs/agent-architecture.md](./docs/agent-architecture.md).

## Stack

SvelteKit, Svelte 5, Tailwind CSS 4, TypeScript, Supabase (Auth + Postgres), Claude API.

All code follows the conventions in [CLAUDE.md](./CLAUDE.md).
