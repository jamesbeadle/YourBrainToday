-- The Human brain — a fourth kind of knowledge beside expertise, experience
-- and process. A kb_brain of category 'people' holds the people around a
-- business as kb_brain_items of kind 'person', and the relationships between
-- them as items of kind 'connection' that record what the relationship is and
-- how warm it runs. No new tables: the category constraint widens.

begin;

alter table public.kb_brains drop constraint if exists kb_brains_category_check;
alter table public.kb_brains add constraint kb_brains_category_check
  check (category in ('domain', 'instance', 'people'));

commit;
