-- 0022: Hive Mind admin review click-through — an admin opens an application
-- and reads the applying brain's bounded contexts and pages, the exact
-- content approval would freeze into the hive snapshot. Both functions are
-- admin-only; the brain stays unreadable to everyone else.

begin;

create or replace function public.hive_mind_application_contexts(application_identifier uuid)
returns table (slug text, name text, summary text, is_core_domain boolean)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  applied_brain uuid;
begin
  perform public.assert_admin();
  select applications.brain_id into applied_brain
  from hive_mind_applications applications
  where applications.id = application_identifier;
  if applied_brain is null then
    raise exception 'application_not_found';
  end if;
  return query
    select contexts.slug, contexts.name, contexts.summary, contexts.is_core_domain
    from brain_contexts contexts
    where contexts.brain_id = applied_brain
    order by contexts.is_core_domain desc, contexts.name;
end;
$$;

create or replace function public.hive_mind_application_pages(application_identifier uuid)
returns table (
  context_slug text,
  kind text,
  slug text,
  title text,
  summary text,
  body text
)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  applied_brain uuid;
begin
  perform public.assert_admin();
  select applications.brain_id into applied_brain
  from hive_mind_applications applications
  where applications.id = application_identifier;
  if applied_brain is null then
    raise exception 'application_not_found';
  end if;
  return query
    select pages.context_slug, pages.kind, pages.slug, pages.title, pages.summary, pages.body
    from brain_pages pages
    where pages.brain_id = applied_brain
    order by pages.kind, pages.title;
end;
$$;

commit;
