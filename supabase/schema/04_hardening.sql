create policy bootstrap_deny_clients on eventin_private.admin_bootstrap for all to anon,authenticated using(false) with check(false);

-- Suspended owners' listings must disappear even if previously paid/approved.
create function eventin_private.owner_active(owner uuid) returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.profiles where id=owner and data->>'accountStatus'='active') $$;
revoke all on function eventin_private.owner_active(uuid) from public;
grant execute on function eventin_private.owner_active(uuid) to anon,authenticated;
drop policy businesses_read on public.businesses;
create policy businesses_read on public.businesses for select to anon,authenticated using((eventin_private.visible(data) and eventin_private.owner_active(owner_id)) or (owner_id=(select auth.uid()) and (select eventin_private.active())) or (select eventin_private.admin('ADMIN_BUSINESS_REVIEW')));
drop policy publications_read on public.public_events;
create policy publications_read on public.public_events for select to anon,authenticated using((eventin_private.visible(data,true) and eventin_private.owner_active(owner_id)) or (owner_id=(select auth.uid()) and (select eventin_private.active())) or (select eventin_private.admin('ADMIN_EVENT_REVIEW')));
create or replace function eventin_private.business_visible(b uuid) returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.businesses where id=b and eventin_private.visible(data) and eventin_private.owner_active(owner_id)) $$;
