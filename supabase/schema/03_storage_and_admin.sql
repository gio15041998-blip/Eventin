-- A single-use bootstrap hash is provisioned separately. No email or browser
-- metadata can grant administrative capabilities.
create table eventin_private.admin_bootstrap (
 id boolean primary key default true check(id),
 token_hash text not null,
 claimed_by uuid references auth.users(id), claimed_at timestamptz
);
revoke all on eventin_private.admin_bootstrap from public,anon,authenticated;
alter table eventin_private.admin_bootstrap enable row level security;

create function eventin_private.claim_admin(token text) returns boolean language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); existing uuid; expected text; actual text; old jsonb; d jsonb; begin
 if u is null or not eventin_private.active() or not exists(select 1 from auth.users where id=u and email_confirmed_at is not null) then raise exception 'Confirma tu correo e inicia sesión.' using errcode='42501'; end if;
 select token_hash,claimed_by into expected,existing from eventin_private.admin_bootstrap where id for update;
 actual:=encode(extensions.digest(token,'sha256'),'hex');
 if expected is null or existing is not null or actual<>expected then raise exception 'Código inválido o ya utilizado.' using errcode='42501'; end if;
 select data into old from public.profiles where id=u for update;
 d:=old||jsonb_build_object('adminCapabilities',jsonb_build_array('ADMIN'));
 update public.profiles set data=d where id=u;
 update eventin_private.admin_bootstrap set claimed_by=u,claimed_at=now(),token_hash='' where id;
 perform eventin_private.audit('claim_admin','user',u,old,d,'Activación mediante código de instalación de un solo uso.');
 return true;
end $$;
revoke all on function eventin_private.claim_admin(text) from public,anon;
grant execute on function eventin_private.claim_admin(text) to authenticated;
create function public.eventin_claim_admin(token text) returns boolean language sql security invoker set search_path='' as $$ select eventin_private.claim_admin(token) $$;
revoke all on function public.eventin_claim_admin(text) from public,anon;
grant execute on function public.eventin_claim_admin(text) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('eventin-covers','eventin-covers',true,5242880,array['image/jpeg','image/png','image/webp']),
 ('eventin-private','eventin-private',false,5242880,array['image/jpeg','image/png','image/webp','application/pdf']);
create policy eventin_covers_read on storage.objects for select to anon,authenticated using(bucket_id='eventin-covers');
create policy eventin_covers_insert on storage.objects for insert to authenticated with check(bucket_id='eventin-covers' and (storage.foldername(name))[1]=(select auth.uid())::text and (select eventin_private.active()));
create policy eventin_covers_delete on storage.objects for delete to authenticated using(bucket_id='eventin-covers' and (storage.foldername(name))[1]=(select auth.uid())::text and (select eventin_private.active()));
-- Private documents have no client write policy while payments are disabled.
create policy eventin_private_read on storage.objects for select to authenticated using(bucket_id='eventin-private' and ((storage.foldername(name))[1]=(select auth.uid())::text or (select eventin_private.admin('ADMIN_PAYMENT_VERIFY'))) and (select eventin_private.active()));

drop policy participant_read on public.proposals;
create policy proposals_read on public.proposals for select to authenticated using(eventin_private.business_access(business_id) or (eventin_private.event_access(event_id) and data->>'status'<>'draft'));

create function eventin_private.notify(recipient uuid,kind text,target uuid,title text,body text,secondary uuid default null) returns void language plpgsql security invoker set search_path='' as $$ begin
 perform eventin_private.put('notifications',gen_random_uuid(),jsonb_build_object('userId',recipient,'kind',kind,'targetId',target,'secondaryId',secondary,'title',title,'body',body,'createdAt',now(),'read',false),recipient);
end $$;
revoke all on function eventin_private.notify(uuid,text,uuid,text,text,uuid) from public,anon,authenticated;
create function eventin_private.notify_change() returns trigger language plpgsql security definer set search_path='' as $$
declare recipient uuid; begin
 if tg_table_name='quote_requests' and tg_op='INSERT' then
  select owner_id into recipient from public.businesses where id=new.business_id;
  perform eventin_private.notify(recipient,'quote_request',new.id,'Nueva solicitud de cotización',new.data->>'privateEventTitle',new.business_id);
 elsif tg_table_name='proposals' and new.data->>'status'='sent' and (tg_op='INSERT' or old.data->>'status'<>'sent') then
  select owner_id into recipient from public.private_events where id=new.event_id;
  perform eventin_private.notify(recipient,'proposal_received',new.id,'Recibiste una propuesta',new.data->>'businessName',new.event_id);
 elsif tg_table_name in ('businesses','public_events') and tg_op='UPDATE' and new.data->>'contentStatus' is distinct from old.data->>'contentStatus' and new.data->>'contentStatus' in ('approved','observed','rejected','suspended') then
  perform eventin_private.notify(new.owner_id,case when tg_table_name='businesses' then 'business_review_result' else 'event_review_result' end,new.id,'Resultado de revisión',coalesce(new.data->>'observationNote','Revisa el estado de tu publicación.'));
 end if;
 return new;
end $$;
revoke all on function eventin_private.notify_change() from public,anon,authenticated;
create trigger eventin_notify_quote after insert on public.quote_requests for each row execute function eventin_private.notify_change();
create trigger eventin_notify_proposal after insert or update on public.proposals for each row execute function eventin_private.notify_change();
create trigger eventin_notify_business after update on public.businesses for each row execute function eventin_private.notify_change();
create trigger eventin_notify_publication after update on public.public_events for each row execute function eventin_private.notify_change();

create function eventin_private.set_cover(kind text,resource uuid,path text) returns void language plpgsql security definer set search_path='' as $$
declare t text; o uuid; before_state jsonb; d jsonb; begin
 if not eventin_private.active() or auth.uid() is null then raise exception 'Inicia sesión.' using errcode='42501'; end if;
 t:=case kind when 'business' then 'businesses' when 'public_event' then 'public_events' end;
 if t is null then raise exception 'Recurso inválido.'; end if;
 execute format('select owner_id,data from public.%I where id=$1 for update',t) into o,before_state using resource;
 if o is distinct from auth.uid() then raise exception 'Sin permiso.' using errcode='42501'; end if;
 if split_part(path,'/',1)<>auth.uid()::text or not exists(select 1 from storage.objects where bucket_id='eventin-covers' and name=path) then raise exception 'Archivo no disponible.'; end if;
 d:=before_state||jsonb_build_object('imageUrl','https://adbiafdfzavahlrwtevk.supabase.co/storage/v1/object/public/eventin-covers/'||path,'contentStatus','draft','version',(before_state->>'version')::int+1);
 execute format('update public.%I set data=$1 where id=$2',t) using d,resource;
end $$;
revoke all on function eventin_private.set_cover(text,uuid,text) from public,anon;
grant execute on function eventin_private.set_cover(text,uuid,text) to authenticated;
create function public.eventin_set_cover(kind text,resource uuid,path text) returns void language sql security invoker set search_path='' as $$ select eventin_private.set_cover(kind,resource,path) $$;
revoke all on function public.eventin_set_cover(text,uuid,text) from public,anon;
grant execute on function public.eventin_set_cover(text,uuid,text) to authenticated;
