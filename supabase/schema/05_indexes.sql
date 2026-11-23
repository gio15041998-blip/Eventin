create index admin_bootstrap_claimed_by_idx on eventin_private.admin_bootstrap(claimed_by);
create index invitations_recipient_email_idx on public.invitations(lower(data->>'recipientEmail'));
create function eventin_private.current_email() returns text language sql stable security definer set search_path='' as $$ select email::text from auth.users where id=auth.uid() and auth.uid() is not null $$;
revoke all on function eventin_private.current_email() from public,anon;
grant execute on function eventin_private.current_email() to authenticated;
drop policy invites_read on public.invitations;
create policy invites_read on public.invitations for select to authenticated using(eventin_private.event_access(event_id,true) or ((select eventin_private.active()) and lower(data->>'recipientEmail')=lower((select eventin_private.current_email()))));
-- Drop only indexes on relationship columns unused by this collection. Keep
-- ownership and actual FK indexes even before the first production traffic.
do $$ declare t text; begin
 foreach t in array array['private_events','businesses','services','public_events','payments','subscriptions','reports','audit_log','notifications','favorites'] loop execute format('drop index if exists public.%I',t||'_event_idx'); end loop;
 foreach t in array array['private_events','memberships','budget_items','tasks','invitations','businesses','public_events','payments','subscriptions','reports','audit_log','notifications','favorites'] loop execute format('drop index if exists public.%I',t||'_business_idx'); end loop;
end $$;
