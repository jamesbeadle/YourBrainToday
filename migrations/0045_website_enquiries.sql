-- 0045: website enquiries. The contact form on the public site creates a lead
-- in the client register, and the ledger learns the event that records what
-- the enquirer wrote. The kind list is the full one shared with 0044 so the
-- two migrations apply cleanly in either order. Safe to re-run.

begin;

alter table public.client_events drop constraint if exists client_events_kind_check;
alter table public.client_events add constraint client_events_kind_check
	check (kind in (
		'stage_moved',
		'contact_added',
		'contact_invited',
		'project_assigned',
		'request_raised',
		'request_decided',
		'request_promoted',
		'build_dispatched',
		'build_live',
		'enquiry_received',
		'lead_added',
		'profile_researched',
		'approach_drafted'
	));

notify pgrst, 'reload schema';

commit;
