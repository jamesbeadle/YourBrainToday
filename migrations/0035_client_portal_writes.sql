-- 0035: the writes a client contact makes for themselves. 0034 gave contacts
-- read access to their own projects and requests; raising a request, replying
-- in its thread, and the ledger entry that records the raise are all writes,
-- and without these policies the portal and the MCP server can only look.
--
-- Every check pins the row to the contact's own client through
-- client_id_for_account(), so a contact can only ever write into their own
-- company's data.

begin;

drop policy if exists "contacts raise their own requests" on public.feature_requests;
create policy "contacts raise their own requests" on public.feature_requests
	for insert with check (
		raised_by_contact_id in (
			select id from public.client_contacts where account_id = auth.uid()
		)
		and exists (
			select 1 from public.projects
			where projects.id = feature_requests.project_id
				and projects.client_id = public.client_id_for_account()
		)
	);

drop policy if exists "contacts comment on their own requests" on public.feature_request_comments;
create policy "contacts comment on their own requests" on public.feature_request_comments
	for insert with check (
		author_account_id = auth.uid()
		and exists (
			select 1 from public.feature_requests
			join public.projects on projects.id = feature_requests.project_id
			where feature_requests.id = feature_request_comments.request_id
				and projects.client_id = public.client_id_for_account()
		)
	);

drop policy if exists "contacts record raising a request" on public.client_events;
create policy "contacts record raising a request" on public.client_events
	for insert with check (
		kind = 'request_raised'
		and client_id = public.client_id_for_account()
		and actor_account_id = auth.uid()
	);

commit;

notify pgrst, 'reload schema';
