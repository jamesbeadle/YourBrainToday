# Launch Readiness — 5 September 2026

Audit of `main` at `8293b4d` against the launch positioning: a consultancy that automates a business, and Knowledge Bases whose first tool is chatbots managers hand to staff. Kept alongside: the MCP server, OAuth and public API; the client portal, requests and Builder; projects and tasks as an internal task manager. Hidden from the UI, code kept: Workflow Map, standalone Domain Brain, Hive Mind / Trade Talk, Market, Accounting, Face.

Every item below was read in the code; items marked **confirmed live** were also verified against the production database (`oortdjuletpansoztdpu`) or the live site. Files are cited so each item is a small, known edit.

## Where it stands today

The site is live at yourbusiness.today and the home page currently advertises Trade Talk and the Marketplace as "live now". Production holds 7 accounts (3 staff, 1 admin), 2 knowledge bases, 2 chatbots with 3 joined staff members and 2,110 pooled credits, and 2 registered OAuth clients (both Claude). The site model is Haiku 4.5. There have been **no real Stripe purchases** — the single row in `purchases` is the free placeholder path described in blocker 1. `npm run check` fails on `main` with 20 real errors (plus 3 that only appear without a `.env`), so CI is red. Vercel could not be inspected from this session (no team access); Supabase point-in-time recovery could not be read from the API and needs a dashboard check.

## Blockers — fix before pointing anyone at it

### 1. Anyone can give themselves free credits — confirmed live
`purchase_credit_pack(pack_identifier)` still exists in production as `security definer`, executable by `authenticated` and `anon`. It inserts a pack's credits (3,000 for Scale) into `credit_ledger` with a fake `cs_test_placeholder_` session id and no Stripe involvement. It is dead code in the app (`src/lib/server/credits/purchaseCreditPack.ts` has no importers) but any signed-in user can call it from the browser with `supabase.rpc('purchase_credit_pack', { pack_identifier: 'scale' })`. The one existing purchase in production came through this path.
Fix: `drop function public.purchase_credit_pack(text);` in a new migration; delete `purchaseCreditPack.ts`.

### 2. Anyone can refund their own spends, which turns top-ups and gifts into credit minting — confirmed live
`refund_credits_for` (`migrations/0028_dynamic_credits.sql:36-64`), `refund_for_brain_question` (`0018:5-31`), `spend_credits_for`, `send_credits` and `top_up_chatbot` are all executable by `authenticated` and `anon`. The only guard in `refund_credits_for` is "cumulative refunds ≤ cumulative spends for that reason". So a user can top up a chatbot (credits move to the pool), then call `refund_credits_for(amount, 'chatbot_top_up')` and get them back while the pool keeps them; or `send_credits` to a second account and refund with reason `credit_gift_sent`. The author's own pattern for service-only RPCs exists in `0023:150-157`, `0031:282-287` and `0032:60-62` but was not applied here.
Fix: one migration that `revoke execute ... from anon, authenticated` on every `refund_*` and `spend_*` function and calls them only through the service client with a server-named payer. The Supabase security advisor lists 64 `security definer` functions callable by `anon`/`authenticated`; most check `auth.uid()` or `require_admin()` internally and are fine, but review the list once.

### 3. A shared viewer can poison a manager's staff chatbot — confirmed live
`kb_brains`, `kb_brain_items` and `kb_brain_bindings` insert policies check only `owner_id = auth.uid()` (`migrations/0024_knowledge_bases.sql:107-108,118-119`; live policies confirmed). Anyone who knows a knowledge-base id can insert a `category='domain'` `kb_brains` row pointing at their own `domain_brain_id` into someone else's knowledge base. The chatbot reads brains by `knowledge_base_id` + `category` via the service role (`src/lib/server/chatbots/getChatbotBrains.ts:114-120`), so staff get answers from attacker-controlled pages, and the owner never sees the row because their view filters by `owner_id`. The app exposes the same gap directly: viewers can create brains via `src/routes/knowledge-base/[knowledgeBaseId]/brains/new/+page.server.ts:34-35` and via the interview harvest (`src/routes/api/knowledge-base/interview/+server.ts:26-27`).
Fix: tighten the three `with check` clauses to require the parent knowledge base's `owner_id = auth.uid()` (mirror `0031:94-102`); add owner checks in `brains/new` and the interview endpoint.

### 4. Migration 0040 (Builder) is not applied to production — confirmed live
`tasks` has no `build_brief`, `build_status`, `pull_request_url`, `build_session_url` or `has_migration` column, yet the code on `main` reads and writes them in ten files (`src/lib/server/builder/*`, `src/lib/server/projects/taskRecord.ts`, `src/lib/components/projects/Build*.svelte`). Every task page and the Builder flow will error in production until `migrations/0040_builder.sql` is run through `scripts/run-migration.sh`. The Supabase migration history only records 29 of the 40 files, which is expected given the psql discipline, but it means "up to date" has to be checked against the schema rather than the list — worth a `docs/` note on how to do that.

### 5. A production database export with personal data is committed to the repo
`backups/YourBusinessToday-supabase-backup-2026-09-05-json.zip` and `.xlsx` contain `auth_users` (emails, identity data for 7 people), `profiles`, `credit_ledger`, `purchases` with Stripe session ids, `client_contacts`, `chatbot_*` conversations, and 354 KB of customer `brain_pages` content. `The Cost of James.pdf` (an internal cost review naming an individual) sits at the root. History is a single squashed commit, so removing them and force-pushing is cheap now and expensive later — and the Builder clones this repo.

### 6. The site sells products you are hiding — confirmed live
`src/lib/data/knowledgeServices.ts:10-29` lists Trade Talk and The Marketplace with `isLive: true`, rendered by `ServicesSection.svelte` on the home page; `siteNavigation.ts:21-22,38` links Marketplace, Trade Talk and Accounting; `/project` (a public page titled "Jewel Bespoke Build") and `/demo-brain` are unguarded; `/vision` sells the Process Map, Workforce and Prospector and links `/project`. Chatbots are not mentioned anywhere on the home page. Hiding is small because the nav lives in one file — see "Hiding the other products" below.

### 7. Terms and privacy describe the wrong products and miss the people who will actually use it
`src/lib/data/termsOfService.ts:12,50-53,70` and `privacyStatement.ts:22,28,51` are written around process maps, the Market and the Hive Mind, and never mention chatbots, knowledge bases, staff members, the client portal, API tokens or the consultancy. A chatbot member is a data subject whose messages go to Anthropic and whose unanswered questions are stored with their `member_id` and readable by their manager (`migrations/0033_chatbot_knowledge_gaps.sql:12-13,31`) — none of that is disclosed. Resend is missing from the sub-processors. The controller has no company number or registered address. Sign-up (`EmailPasswordForm.svelte`) never surfaces the terms. And `/account` renders `PayoutDetailsPanel` and `RevenueSharePanel` (`src/routes/account/+page.svelte:73-74`) — a Trade Talk feature that stores plain-text bank details with `Jewel Bespoke Build Ltd / 60-83-71` as placeholders (`PayoutDetailsPanel.svelte:63,78`) and is not disclosed in the privacy statement.

### 8. Two paid endpoints keep the credits when Claude fails
`/api/knowledge-base/interview/+server.ts:29-47` and `/api/knowledge-base/brain-ask/+server.ts:104-112` call `spendCredits` then `requestAnthropic` with no try/catch and no `refundCredits`, unlike `/api/brain/ask:50-60` and the chatbot ask endpoint which do it correctly. `docs/model-pricing.md:53-54` claims failures refund; for these two it is false. `interviewAgent.ts:48-50` also returns a canned "offline" reply after charging when `ANTHROPIC_API_KEY` is unset.

## Should fix before launch

### 9. CI is red on `main`
20 real `svelte-check` errors: 14 in `src/lib/server/market/*` (Supabase typing on joins), 3 in `src/lib/components/face/_to_delete/*` (missing modules — the folder is dead but still compiled), 1 in `src/lib/server/sharing/runProposedIngest.ts:19` (calls `ingestSource` with 4 of 5 arguments — a real bug in workflow-map share proposals), 2 in `src/routes/projects/[projectId]/+page.svelte:51,53` (`form.message` on an untyped action union — launch path). Delete `_to_delete/`, fix or exclude the market files, type the projects page action. CI also has no `PUBLIC_SUPABASE_*` values, so `$env/static/public` fails there too — set them as repository variables.

### 10. The consultancy has nowhere to go
The hero headline is right ("Consultants who know your business") but the body never says the consultancy automates a business, and there is no consultancy CTA, no `/contact`, no `mailto:`, no booking link anywhere in `src/`. Two "get in touch" strings point nowhere (`OutOfCreditsNotice.svelte:4`, `account/credits/+page.svelte:24`). The only email on the site is in the legal text. Three domains appear in the repo: `yourbusiness.today` (legal), `yourbusinesstoday.uk` (`.env.example` `EMAIL_FROM`), `yourbusinesstoday.com` (signature instructions).

### 11. Staff land in the wrong place, and can be invited into a dead end
Sign-in sends everyone to `/knowledge-base` (`src/lib/server/auth/localDestination.ts:1`), where a staff member sees "Create your first knowledge base" above the chatbots they were invited to (`knowledge-base/+page.svelte:46-69`) and the full Explore menu. Allowances are only set at top-up (`top_up_chatbot`, `0031:170-172`; `parseTopUpForm.ts:9` rejects 0), so a member invited after the top-up has allowance 0 and sees "Your allowance for this period is used up" with no explanation. There is no resend-invite action despite the copy promising one (`inviteChatbotMember.ts:26`). The bot only reads expertise brains (`getChatbotBrains.ts:23-29`) — the interview's experience brain and the process map are never consulted, and the UI does not say so. Nothing in production is currently affected (0 members with zero allowance), but the first real customer will hit it.

### 12. Stripe has never taken a real payment
0 real purchases. The webhook verifies signatures and is idempotent on session id, but does not check `payment_status === 'paid'`, handles only `checkout.session.completed` (no `charge.refunded`), and the success page does not reconcile if the webhook is late (`account/credits/+page.server.ts:16`). `credit_packs`, `complete_stripe_purchase`, `credit_balance()`, `credit_ledger` and `profiles` exist only in the live database, not in `migrations/`, so the schema is not reproducible. `creditPricing.ts:27` hard-codes `12.99 * 100 / 3000` beside the `credit_packs` table — two sources of truth. No terms link at checkout. Do the one real £2.99 purchase from the old plan before launch.

### 13. No rate limits on the endpoints that cost money or send email
Chatbot ask, interview, brain-ask, `/api/v1/brains/[id]/ask` (also has no question length cap, `+server.ts:68-72`), `/oauth/register` (public, unbounded inserts), `/api/workspace/shares` and chatbot invites (each sends an email). Per-member allowances bound chatbot drain; nothing bounds the rest.

### 14. Supabase auth hardening
Leaked-password protection is off (advisor warning). Auth emails (confirm, reset) go through Supabase's default sender — `docs/auth-setup.md` never mentions SMTP — so they arrive from `noreply@mail.app.supabase.io` with the low built-in rate limit. Point them at Resend and document it.

### 15. Admin: hard-coded Gmail, no runbook, no way to reverse credits
The first admin is chosen by `coalesce(new.email,'') = 'jamesbeadle1989@gmail.com'` in the signup trigger (`migrations/0004_no_welcome_credits.sql:20-22`, repeated in `docs/sql/*`). There is no runbook (the launch plan asked for one), `admin_grant_credits` refuses negative amounts so nothing can reverse a purchase, there is no self-service account deletion, and `admin_delete_user` refuses accounts that own team data while the privacy statement promises deletion.

### 16. No error sink
Errors are `console.error` only; no `handleError` in `hooks.server.ts`, no Sentry or equivalent, no alert when a refund or settlement silently fails (`settleChatbotQuestion.ts:65-68`). `getUserModelOverride.ts:11-13` swallows lookup errors, so an admin's model pin can silently fall back to the site model and bill the wrong rung. Anthropic usage is metered but not stored, so the margin cannot be measured.

### 17. A decision: process brains
The knowledge base seeds three brains — expertise, experience and process (`seedKnowledgeBaseBrains.ts:7-15`). The process brain *is* the Workflow Map at `/workspace/[entity]/workflows/[id]`, and the expertise editor redirects into `/workspace/[entity]/domains/[id]`. Those two routes cannot be hidden without breaking Knowledge Bases. Either keep them (and stop calling the Workflow Map hidden) or remove the process kind from seeding, the kind picker and the home cards together.

## Later

Convention sweep on the launch path: split the three files over 100 lines (`chatbots/[id]/manage/+page.server.ts` 126, `ChatbotChat.svelte` 111, `instanceBrainTypes.ts` 103; `ApiPanel.svelte` 198 is reached from the KB page), rename `kb*` to `knowledgeBase*`, dedupe `bearerToken` (`resolveApiCaller.ts:143-147` vs `tokens/apiToken.ts:163-167`), name the `* 1000` and pack constants. No tests exist and CI runs only `svelte-check` — add vitest for `creditPricing`, `readClientRegistration`, `exchangeAuthorizationCode`, `verifyGithubSignature`, and run `npm run build`. SEO: no `og:*` tags, no sitemap, `robots.txt` allows `/admin` and every hidden route, three pages lack titles. Docs: README's Status section describes hidden products; `launch-plan.md` is Domain-Brain-only; `stripe-setup.md` describes a fallback that no longer exists; delete the two "safe to delete" stubs; complete `.env.example`. Repo tidy: banners, logo HTML, signature instructions, `probe-actiondata.ts`, `scripts/checkMapLabels.ts`. Confirm point-in-time recovery is on in the Supabase dashboard and add an uptime check on `/` and `/api/chatbots/*/ask`.

## Hiding the other products

Because the nav is centralised this is a short list. `siteNavigation.ts:21-22,38` (Marketplace, Trade Talk, Accounting). `kbRail.ts:39-51` remove `sell` and `tradeTalk` from `ownerKeys`. `knowledgeServices.ts` replace both entries with Chatbots. `account/+page.svelte:73-74` drop the two Trade Talk panels. `admin/+page.svelte:25` drop `HiveReviewPanel`. `vision/+page.svelte:33-60,82-88` rewrite. Guard or redirect `/project`, `/demo-brain`, `/face`, `/trade-talk`, `/market`, `/workspace/[entity]/domains/new`; repoint `hive-mind/+page.server.ts:5`. The KB page still imports market and hive (`kbWorkbenchData.ts:48-56`, `KbPanelContent.svelte:79-88`, `applyToHiveMind` in `knowledge-base/[id]/+page.server.ts:82-98`) — decouple so hiding is a deletion, not an edit. Then `robots.txt`.

## Suggested order of work

Session 1 — money and data safety: migration 0041 (drop `purchase_credit_pack`, revoke grants on `spend_*`/`refund_*`, tighten `kb_brains` policies), apply 0040, remove `backups/` and the PDF and force-push, wrap the two endpoints in refund-on-failure. Half a day, mostly SQL.

Session 2 — the face of the launch: hide the products (list above), rewrite hero, services, vision and footer for the two messages, add a contact route, fix the staff landing and the allowance trap, add resend-invite. One day.

Session 3 — paperwork and payment: terms and privacy rewritten for chatbots and members, company details, sign-up consent, one real Stripe purchase, `payment_status` check, success-page reconciliation, Resend SMTP for auth mail, leaked-password protection on. Half a day.

Session 4 — hygiene: CI green, rate limits, error sink, admin runbook and bootstrap, then the "Later" list as time allows.

## Progress — 5 September, evening

Blockers 1 to 4 are fixed in production: migrations 0040 and 0042 to 0046 are applied, so the free credit path and the self-refund are gone, the chatbot policies are tightened, and the Builder tables exist. Items 5 to 11, 13, 16, 17 and the lead-generation work are on the `launch-readiness` branch awaiting merge. Stripe (12), the rate limits, and the admin runbook are being finished in parallel on the same branch. Supabase auth hardening (14) still needs the dashboard steps written up in `docs/email-setup.md` — SMTP through Resend and leaked-password protection — before the box can be ticked. The admin item (15) is unchanged by request.

What remains sits with the owner: fill in `src/lib/data/companyDetails.ts`, review the home and case-study copy, add the GitHub repository variables so CI has the public Supabase values, make one real purchase to prove the Stripe path end to end, and after the merge force-push so the old backups leave the history for good.
