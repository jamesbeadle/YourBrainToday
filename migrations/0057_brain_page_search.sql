-- 0057: searching the pages of one expertise brain.
--
-- The modeller answering a question sees only the index — one line per
-- page — so a fact that the summary does not mention is invisible to it.
-- search_brain_pages lets it search the page bodies of the brain it is
-- answering for, the way search_knowledge_base does across a knowledge base,
-- using the full-text index 0056 built on brain_pages.
--
-- Runs as the caller: a signed-in person sees what row level security lets
-- them see, and the service role (an API token already proved to reach the
-- brain) sees every page of it.

begin;

create or replace function public.search_brain_pages(
  searched_brain_id uuid,
  search_query text,
  most_hits integer default 20
)
returns table (
  slug text,
  kind text,
  title text,
  snippet text,
  rank real
)
language sql
stable
set search_path to 'public'
as $$
  with query as (
    select websearch_to_tsquery('english', search_query) as terms
  )
  select
    page.slug,
    page.kind,
    page.title,
    ts_headline('english', page.summary || ' ' || page.body, query.terms,
      'MaxWords=40, MinWords=20, MaxFragments=1') as snippet,
    ts_rank(to_tsvector('english', page.title || ' ' || page.summary || ' ' || page.body), query.terms) as rank
  from brain_pages page
  cross join query
  where page.brain_id = searched_brain_id
    and to_tsvector('english', page.title || ' ' || page.summary || ' ' || page.body) @@ query.terms
  order by rank desc, page.title
  limit greatest(1, least(most_hits, 50));
$$;

grant execute on function public.search_brain_pages(uuid, text, integer) to authenticated, service_role;

commit;
