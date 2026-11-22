-- Eventin: JSON documents preserve the typed UI contract; relational keys,
-- constraints, RLS and server commands own authorization and state changes.
create schema if not exists eventin_private;
revoke all on schema eventin_private from public;
grant usage on schema eventin_private to anon, authenticated;

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 data jsonb not null check (jsonb_typeof(data) = 'object'),
 created_at timestamptz not null default now()
);
create table public.platform_settings (
 id boolean primary key default true check(id), data jsonb not null
);
insert into public.platform_settings(data) values ('{"businessMonthlyPen":30,"publicEventMonthlyPen":100,"beneficiaryConfigured":false,"beneficiaryName":"","beneficiaryChannel":"","beneficiaryAccount":"","beneficiaryNote":"Pagos deshabilitados. Integración Izipay pendiente."}');

do $$ declare t text; begin
 foreach t in array array['private_events','memberships','budget_items','tasks','invitations','businesses','services','public_events','quote_requests','proposals','payments','subscriptions','reports','audit_log','notifications','favorites'] loop
  execute format('create table public.%I (id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id), event_id uuid, business_id uuid, data jsonb not null check(jsonb_typeof(data) = ''object''), created_at timestamptz not null default now())',t);
  execute format('create index %I on public.%I(owner_id)',t||'_owner_idx',t);
  execute format('create index %I on public.%I(event_id) where event_id is not null',t||'_event_idx',t);
  execute format('create index %I on public.%I(business_id) where business_id is not null',t||'_business_idx',t);
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon, authenticated',t);
  execute format('grant select on public.%I to authenticated',t);
 end loop;
 foreach t in array array['memberships','budget_items','tasks','invitations','quote_requests','proposals'] loop
  execute format('alter table public.%I add foreign key(event_id) references public.private_events(id) on delete cascade',t);
 end loop;
 foreach t in array array['services','quote_requests','proposals'] loop
  execute format('alter table public.%I add foreign key(business_id) references public.businesses(id) on delete cascade',t);
 end loop;
end $$;
create unique index memberships_event_user_unique on public.memberships(event_id,owner_id);
create unique index favorites_user_resource_unique on public.favorites(owner_id,(data->>'kind'),(data->>'id'));
create unique index invitations_token_unique on public.invitations((data->>'token'));
create unique index proposals_request_unique on public.proposals((data->>'requestId'));
alter table public.profiles enable row level security;
alter table public.platform_settings enable row level security;
revoke all on public.profiles, public.platform_settings from anon, authenticated;
grant select on public.profiles to authenticated;
grant select on public.platform_settings, public.businesses, public.services, public.public_events to anon, authenticated;

create function eventin_private.active() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.profiles where id=auth.uid() and data->>'accountStatus'='active')
$$;
create function eventin_private.admin(cap text default 'ADMIN') returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.profiles where id=auth.uid() and data->>'accountStatus'='active' and ((data->'adminCapabilities') ? 'ADMIN' or (data->'adminCapabilities') ? cap))
$$;
create function eventin_private.event_access(e uuid, owner_only boolean default false) returns boolean language sql stable security definer set search_path='' as $$
 select eventin_private.active() and (exists(select 1 from public.private_events where id=e and owner_id=auth.uid()) or (not owner_only and exists(select 1 from public.memberships where event_id=e and owner_id=auth.uid())))
$$;
create function eventin_private.business_access(b uuid) returns boolean language sql stable security definer set search_path='' as $$
 select eventin_private.active() and exists(select 1 from public.businesses where id=b and owner_id=auth.uid())
$$;
create function eventin_private.visible(d jsonb, is_event boolean default false) returns boolean language sql stable set search_path='' as $$
 select d->>'contentStatus'='approved' and d->>'paymentStatus'='verified' and (d->>'subscriptionActive')::boolean and (d->>'subscriptionPeriodEnd')::timestamptz>now() and (not is_event or (d->>'endsAt')::timestamptz>now())
$$;
create function eventin_private.business_visible(b uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.businesses where id=b and eventin_private.visible(data))
$$;
revoke all on all functions in schema eventin_private from public;
grant execute on all functions in schema eventin_private to anon,authenticated;

create policy profiles_read on public.profiles for select to authenticated using (id=(select auth.uid()) or (select eventin_private.admin('ADMIN_USER_MANAGE')));
create policy settings_read on public.platform_settings for select to anon,authenticated using(true);
create policy events_read on public.private_events for select to authenticated using(eventin_private.event_access(id));
create policy businesses_read on public.businesses for select to anon,authenticated using(eventin_private.visible(data) or (owner_id=(select auth.uid()) and (select eventin_private.active())) or (select eventin_private.admin('ADMIN_BUSINESS_REVIEW')));
create policy publications_read on public.public_events for select to anon,authenticated using(eventin_private.visible(data,true) or (owner_id=(select auth.uid()) and (select eventin_private.active())) or (select eventin_private.admin('ADMIN_EVENT_REVIEW')));
create policy services_read on public.services for select to anon,authenticated using(eventin_private.business_access(business_id) or (eventin_private.business_visible(business_id) and (data->>'active')::boolean));
do $$ declare t text; begin
 foreach t in array array['memberships','budget_items','tasks'] loop
  execute format('create policy event_read on public.%I for select to authenticated using(eventin_private.event_access(event_id))',t);
 end loop;
 foreach t in array array['quote_requests','proposals'] loop
  execute format('create policy participant_read on public.%I for select to authenticated using(eventin_private.event_access(event_id) or eventin_private.business_access(business_id))',t);
 end loop;
end $$;
create policy invites_read on public.invitations for select to authenticated using(eventin_private.event_access(event_id,true) or ((select eventin_private.active()) and lower(data->>'recipientEmail')=lower((select auth.jwt()->>'email'))));
create policy payments_read on public.payments for select to authenticated using((owner_id=(select auth.uid()) and (select eventin_private.active())) or (select eventin_private.admin('ADMIN_PAYMENT_VERIFY')));
create policy subscriptions_read on public.subscriptions for select to authenticated using((owner_id=(select auth.uid()) and (select eventin_private.active())) or (select eventin_private.admin('ADMIN_SUBSCRIPTION')));
create policy reports_read on public.reports for select to authenticated using((owner_id=(select auth.uid()) and (select eventin_private.active())) or (select eventin_private.admin('ADMIN_REPORT_MANAGE')));
create policy audit_read on public.audit_log for select to authenticated using((select eventin_private.admin('ADMIN_AUDIT_READ')));
create policy notifications_read on public.notifications for select to authenticated using(owner_id=(select auth.uid()) and (select eventin_private.active()));
create policy favorites_read on public.favorites for select to authenticated using(owner_id=(select auth.uid()) and (select eventin_private.active()));

create function eventin_private.new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,data) values(new.id,jsonb_build_object('id',new.id,'name',left(coalesce(new.raw_user_meta_data->>'name','Usuario Eventin'),120),'email',new.email,'phone',left(coalesce(new.raw_user_meta_data->>'phone',''),30),'city','','capabilities',jsonb_build_array('personal','business','publisher'),'adminCapabilities','[]'::jsonb,'accountStatus','active'));
 return new;
end $$;
revoke all on function eventin_private.new_user() from public,anon,authenticated;
create trigger eventin_new_user after insert on auth.users for each row execute function eventin_private.new_user();

create function public.eventin_snapshot() returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb:='{}'; pair text[]; rows jsonb; begin
 foreach pair slice 1 in array array[['profiles','users'],['public_events','publicEvents'],['businesses','businesses'],['services','services'],['private_events','privateEvents'],['memberships','memberships'],['budget_items','budgetItems'],['tasks','tasks'],['invitations','invitations'],['quote_requests','quoteRequests'],['proposals','proposals'],['payments','payments'],['subscriptions','subscriptions'],['reports','reports'],['audit_log','auditLog'],['notifications','notifications'],['favorites','favorites']] loop
  if auth.uid() is null and pair[1] not in ('public_events','businesses','services') then rows:='[]'; else
   execute format('select coalesce(jsonb_agg(data order by created_at,id),''[]'') from public.%I',pair[1]) into rows;
  end if;
  result:=result||jsonb_build_object(pair[2],rows);
 end loop;
 return result||jsonb_build_object('settings',(select data from public.platform_settings where id),'currentUserId',auth.uid());
end $$;
revoke all on function public.eventin_snapshot() from public;
grant execute on function public.eventin_snapshot() to anon,authenticated;

-- Internal writer cannot be called from client roles. No dynamic identifiers
-- come from requests; command dispatch uses a fixed allowlist.
create function eventin_private.put(t text,k uuid,d jsonb,o uuid,e uuid default null,b uuid default null) returns jsonb language plpgsql security invoker set search_path='' as $$
begin
 d:=d||jsonb_build_object('id',k);
 execute format('insert into public.%I(id,owner_id,event_id,business_id,data) values($1,$2,$3,$4,$5) on conflict(id) do update set data=excluded.data',t) using k,o,e,b,d;
 return d;
end $$;
revoke all on function eventin_private.put(text,uuid,jsonb,uuid,uuid,uuid) from public,anon,authenticated;

create function eventin_private.audit(action text,kind text,rid uuid,before_state jsonb,after_state jsonb,reason text) returns void language plpgsql security invoker set search_path='' as $$
declare k uuid:=gen_random_uuid(); begin
 perform eventin_private.put('audit_log',k,jsonb_build_object('actorId',auth.uid(),'actorName',(select data->>'name' from public.profiles where id=auth.uid()),'action',action,'resourceKind',kind,'resourceId',rid,'resourceTitle',coalesce(after_state->>'title',after_state->>'name',''),'previousState',before_state::text,'newState',after_state::text,'reason',reason,'timestamp',now()),auth.uid());
end $$;
revoke all on function eventin_private.audit(text,text,uuid,jsonb,jsonb,text) from public,anon,authenticated;
