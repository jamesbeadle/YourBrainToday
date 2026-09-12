-- 0048: the per-minute spend gate (src/lib/server/credits/recentSpendCount.ts)
-- counts a user's recent debits before every paid request, so the ledger must
-- answer "this user, since this moment" without a scan. Safe to re-run.

begin;

create index if not exists credit_ledger_by_user_recency
  on public.credit_ledger (user_id, created_at desc);

commit;
