-- 0043: chatbot allowances without a top-up. Until now the only way to change
-- what a member may spend was to top the pool up (top_up_chatbot, 0031), which
-- also reset every member's period. set_chatbot_allowances changes the
-- allowances alone — spent counters and the pool are left as they are — so an
-- owner can raise one person's limit mid-period, or hand a new invitee an
-- allowance without funding the bot again. Same owner check and lock as the
-- top-up; member_allowances is [{"memberId": uuid, "allowance": int}].
-- Safe to re-run.

begin;

create or replace function public.set_chatbot_allowances(
  target_chatbot uuid,
  member_allowances jsonb
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  allowance record;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  if not exists (select 1 from chatbots where id = target_chatbot and owner_id = auth.uid()) then
    raise exception 'not_chatbot_owner';
  end if;
  perform pg_advisory_xact_lock(hashtext(target_chatbot::text));
  for allowance in
    select (item ->> 'memberId')::uuid as member_row_id,
           greatest(0, coalesce((item ->> 'allowance')::integer, 0)) as credits
    from jsonb_array_elements(coalesce(member_allowances, '[]'::jsonb)) as item
    where (item ->> 'memberId') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  loop
    update chatbot_members
      set allowance_credits = allowance.credits
      where id = allowance.member_row_id and chatbot_id = target_chatbot;
  end loop;
  update chatbots set updated_at = now() where id = target_chatbot;
end;
$$;

commit;
