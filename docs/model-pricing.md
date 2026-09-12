# Model choice and usage-priced questions

Every question on the site runs on a Claude model the asker chose, and is priced so the site
always clears Anthropic's bill with margin. Added 2026-09-03 with James's decisions: a slider
from cheap to expensive over the current Anthropic line-up, reserve-then-settle pricing, a 3×
markup on cost (his floor is "100% on top"), and per-member overrides on chatbots.

## The ladder

`src/lib/data/modelLadder.ts` is the single list, cheapest first: Haiku 4.5 ($1/$5 per MTok),
Sonnet 5 ($2/$10), Opus 5 ($5/$25), Fable 5.1 ($10/$50). Each rung carries a `floorCredits`
(10 / 20 / 50 / 100 — proportional to the input rate) which is both the reserve taken before a
question and the least it can ever cost. Older ids the site setting or an admin pin may still
name (`claude-sonnet-4-5`, `claude-opus-4-8`, `claude-fable-5`…) map to the rung above them;
a dated id matches its rung by prefix; an id nothing recognises prices at the top rung, so a
surprise can never undercharge. `siteModels.ts` (the admin's site-model select) now derives
from the ladder.

## Who chooses

The request's model resolves in this order: admin pin (`user_model_overrides`, 0030) → the
user's own choice (`user_model_preferences`, 0032, RLS user-owned) → the site setting. The
slider lives on `/account` (`ModelChoicePanel` → `ModelSlider`, action `saveModel`); a pinned
user sees a caution and their slider is saved but inert. `getUserModelOverride` reads both
tables so `hooks.server.ts` needed no change.

A chatbot has `chatbots.model_id` (slider on the manage page, action `setModel`) and each
member row has an optional `chatbot_members.model_id` (a "Bot default / Haiku / Sonnet / Opus /
Fable" select, action `setMemberModel`). The member's effective model is the override or the
bot's, and `askChatbot` pins it on the request (`AnthropicRequest.model`) so the member's
question never runs on the calling session's model.

## How a question is priced

`requestAnthropic` records every call it makes — the model asked for and the usage block the
API returns — into the request's AsyncLocalStorage context (`recordMeteredCall` /
`meteredCallsSoFar` in `modelContext.ts`). `creditPricing.ts` turns that into credits:

    bill (pence)   = Σ tokens × rung rate × $→£ (0.74), cache reads at 0.1× input,
                     cache writes at 1.25× input
    owed (credits) = max(rung floor, ceil(bill × costMarkup / creditValuePence))

`creditValuePence` is the cheapest pack's rate (Scale, £12.99 for 3,000 ≈ 0.43p) so the margin
holds whichever pack the buyer used; `costMarkup` is 3. The packs live once, in
`src/lib/data/creditPacks.ts`, and `creditValuePence` derives from the cheapest of them;
`getCreditPacks` refuses to serve a `credit_packs` table that disagrees with that list, so a
pack added to the database without the constant can never sell credits below the value every
job is priced at. `costMarkup` and `usdToGbp` sit at the top of `creditPricing.ts` — with the
pack list, the only numbers to tune.

Endpoints follow reserve-then-settle: take the floor for the resolved model before the work
(`spendCredits(reserve, reason)`), answer, then `settleQuestionUsage(payer, reserve, reason)`
takes whatever `owed − reserve` is positive under `reason + '_usage'` (`brain_question_usage`,
`kb_interview_usage`, `hive_mind_question_usage`, `agent_reply_usage`…) through the service-role
RPC `settle_credits_for(payer, amount, reason)`, which has **no balance check** — the balance may
go negative until the next pack. That is deliberate: a settlement that could bounce would make
the floor the real price for anyone who keeps their balance near it. Failure before the answer
refunds the reserve through `refundQuestionUsage`, which also records what the failed attempt
cost (below). Wired into `/api/brain/ask`, `/api/face-chat`, `/api/knowledge-base/brain-ask`,
`/api/knowledge-base/interview`, `/api/hive-mind/ask` and `/api/agent-chat`. The last two keep
their fixed RPCs (25 with the specialists' pool; 10 per reply) and top the reserve up to the
model floor under the same reason when the floor is higher; a failed Trade Talk question refunds
the whole reserve, top-up included. The depth and harvest surcharges stay separate product fees:
the harvest filed from an agent reply or an interview turn comes out of the reply's own tokens,
which the settlement already covers, so the 2-credit-per-item harvest fee on `/api/agent-chat` is
margin, not cost recovery (the interview files its harvest without that fee).

The same shape now covers every other job that runs the Modeller. Ingest and re-read reserve the
byte-priced `ingestCreditsFor` under `brain_ingest_sized` and settle beyond it — a 25 KB document
read on Fable owes around 250 credits against the flat 50 that was charged before. Prune (25) and
unlearn (50) settle beyond their fixed prices; a chatbot teaching note settles beyond its ingest
price under `chatbot_teach`; and the bearer API (`/api/v1/brains/[id]/ask`) keeps its fixed 10
through `spend_for_brain_api_question`, runs on the cheapest rung because there is no session
to resolve a slider from, and settles the marked-up bill beyond the 10 against the brain owner
under `brain_api_question_usage`. What a job finally owes is `max(reserve, floor, marked-up bill)`
— the reserve is never refunded down.

Chatbots settle against the pool instead: `settleChatbotQuestion` calls
`settle_chatbot_question(chatbot, member, extra)` (service-role only, 0032), which moves `extra`
from the pool onto the member's counter. Neither the allowance (James allows a member to run
over their allocation) nor the pool is re-checked: the pool may go negative until the owner tops
up, and the bot stops answering as soon as it cannot cover a floor. The ask endpoint returns
`creditsCharged` and the settled `allowanceRemaining`.

## What is recorded

Every metered call is stored at settlement in `model_usage` (migration 0042; service-role
writes, admin reads): the payer, the ledger reason, the chatbot when the pool paid, the model,
the four token counts, Anthropic's cost in pence (`usageCostPence`) and the share of the credits
the job charged — one number per job, apportioned across its calls in proportion to cost so the
rows always sum back to the ledger. `recordModelUsage` is the only writer; `settleQuestionUsage`,
`refundQuestionUsage` and `settleChatbotQuestion` are the only callers. Three outcomes land:

- settled — `credits_charged` is what the job finally owed (reserve plus settlement);
- refunded — the job failed after Claude had answered part of it, the reserve went back, and the
  calls are recorded at zero credits: the cost of the failure, visible;
- `has_failed_settlement` — `settle_credits_for` (or the chatbot settle) itself failed, the row
  carries only the reserve, and the shortfall shows as leakage instead of a log line.

A write that fails is reported and never turns a delivered answer into a refund.

## The margin view

`/admin/usage` (admin only; `src/lib/server/admin/usage/`, service-role reads) shows the last 7,
30 or 90 days (`?days=`, default 30): totals for Claude cost, revenue at pack value, margin,
metered calls and settlement failures with the cost they left unrecovered; per model, calls,
tokens, cost, credits and margin; per user, credits bought (paid packs), granted (welcome, promo,
gifts, earnings), spent, refunded, the all-time balance, Claude cost, revenue and margin. Revenue
is net credits spent (spent − refunded) × `creditValuePence`: the least the business was paid for
those credits, so the margin shown is the floor, not the average.

## Abuse limits

Two kinds of gate stand in front of anything that costs money or sends an email. Per-user gates
count rows the database already holds, because a Vercel instance is ephemeral and remembers
nothing between requests; per-address gates on public endpoints live in memory
(`src/lib/server/http/addressRateLimit.ts`) and bound a burst from one address, which is all an
anonymous endpoint can be held to. Every count is `head: true` — no rows travel.

| Endpoint or action | Signal | Allowance | Window | Refusal |
| --- | --- | --- | --- | --- |
| `POST /contact` (`sendEnquiry`) | in-memory, client address | 5 | 10 minutes | silently accepted, nothing recorded |
| `POST /oauth/register` | in-memory, client address | 10 | 1 hour | 429 `too_many_registrations` |
| `/api/brain/ask`, `/api/brain/ingest`, `/api/knowledge-base/brain-ask`, `/api/knowledge-base/interview`, `/api/agent-chat` | `credit_ledger` debits (`delta < 0`) for the user, through their own session | 30 (`mostSpendsPerMinute`) | 1 minute | 429 "Slow down — try again in a minute" |
| `/api/v1/brains/[id]/ask` | the brain owner's `credit_ledger` debits with reason `brain_api_question`, through the service client | 30 | 1 minute | 429, same message |
| `/api/chatbots/[id]/ask` | the member's own `chatbot_messages` (`speaker = 'member'`) — the pool pays, so the ledger says nothing about the member | 15 (`mostMemberQuestionsPerMinute`) | 1 minute | 429, same message |
| `POST /api/workspace/shares` | `workspace_invites` rows owned by the user | 20 (`mostInvitesPerHour`) | 1 hour | 429 |
| chatbot `inviteMember`, `resendInvite` | `chatbot_members` rows owned by the user | 20 | 1 hour | `fail(429)` |
| client `inviteContact` (form and MCP `invite_client_contact`) | `client_events` of kind `contact_invited` by the actor | 20 | 1 hour | `fail(429)` / MCP message |

The ledger gates live in `src/lib/server/credits/recentSpendCount.ts` and `requireSpendHeadroom.ts`
and run before the reserve is taken; a question usually writes two debits (reserve and
settlement), so thirty debits is roughly fifteen questions a minute. The chatbot gate is
`src/lib/server/chatbots/requireMemberQuestionHeadroom.ts`. The invite allowance is one module,
`src/lib/server/email/inviteAllowance.ts`, with a count per table beside the code it protects
(`sharing/recentWorkspaceInviteCount.ts`, `chatbots/recentChatbotInviteCount.ts`,
`clients/recentContactInviteCount.ts`). Migration 0048 indexes `credit_ledger (user_id,
created_at)` so the per-minute count is a range read. Every session endpoint caps the question at
`longestQuestion` (`src/lib/data/questionLimits.ts`, 1,000 characters), the bearer API included.

Known gaps: resending a chatbot invite writes nothing, so resends are refused only while the
hour's new invites stand at the allowance; and re-inviting an already-invited workspace address
sends the email without a row, so it is not counted either.

## Not covered yet

The bearer API charges the owner's ledger but runs on the cheapest rung rather than the owner's
slider. Interview harvests carry no per-item fee where agent replies do.
