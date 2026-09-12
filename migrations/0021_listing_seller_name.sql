-- 0021: listings show the seller's display name, never their email address.
-- The name is denormalized onto the listing when it is saved, the same idiom
-- as owner_email (which stays stored for the owner's records but is no longer
-- sent to browsers). Existing listings are backfilled from profiles.

begin;

alter table public.brain_listings add column owner_name text not null default '';

update public.brain_listings
set owner_name = coalesce(
  (select display_name from public.profiles where profiles.id = brain_listings.owner_id),
  ''
);

commit;

notify pgrst, 'reload schema';
