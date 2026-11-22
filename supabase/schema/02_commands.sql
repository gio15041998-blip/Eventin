create or replace function eventin_private.command(action text, input jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 u uuid:=auth.uid(); k uuid:=gen_random_uuid(); e uuid; b uuid; o uuid; r uuid;
 d jsonb; old jsonb; other jsonb; settings jsonb; t text; decision text; field text;
 required text[]; start_at timestamptz; end_at timestamptz; n numeric; expires timestamptz;
begin
 if u is null or not eventin_private.active() then raise exception 'Accede con una cuenta activa.' using errcode='42501'; end if;
 if jsonb_typeof(input)<>'object' or octet_length(input::text)>100000 then raise exception 'Solicitud no válida.'; end if;
 -- Serialize repeated actions by the same actor; shared-resource branches also lock rows.
 perform pg_advisory_xact_lock(hashtextextended(u::text,0));
 select data into settings from public.platform_settings where id;
 -- Reject incomplete/ambiguous JSON values before any write. Bounds also keep
 -- untrusted amounts finite and within a sensible PEN range.
 required:=case action
  when 'createPrivateEvent' then array['guestCount','targetBudgetPen']
  when 'addBudgetItem' then array['estimatedPen']
  when 'createQuoteRequest' then array['guestCount','estimatedBudgetPen']
  when 'saveProposalDraft' then array['amountPen']
  else array[]::text[] end;
 foreach field in array required loop
  if coalesce(jsonb_typeof(input->field),'null')<>'number' or (input->>field)::numeric not between 0 and 100000000 then raise exception 'Revisa los importes y cantidades.'; end if;
 end loop;
 if action in ('addTask','createPrivateEvent','createQuoteRequest') and coalesce(input->>case when action='addTask' then 'dueDate' else 'eventDate' end,'') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Fecha no válida.'; end if;
 if action='saveProposalDraft' and (coalesce(input->>'expiresAt','')='' or jsonb_typeof(input->'inclusions')<>'array' or jsonb_typeof(input->'exclusions')<>'array') then raise exception 'Revisa el contenido y la vigencia de la propuesta.'; end if;
 case action
 when 'createPrivateEvent' then
  required:=array['title','celebrationType','eventDate','zone'];
  foreach field in array required loop if length(trim(coalesce(input->>field,''))) not between 1 and 200 then raise exception 'Completa los datos del evento.'; end if; end loop;
  if (input->>'eventDate')::date < (now() at time zone 'America/Lima')::date or (input->>'guestCount')::integer<1 or (input->>'targetBudgetPen')::numeric<0 then raise exception 'Revisa fecha, invitados y presupuesto.'; end if;
  d:=input||jsonb_build_object('id',k,'ownerId',u,'proposedBusinessIds','[]'::jsonb,'createdAt',now());
  d:=eventin_private.put('private_events',k,d,u);
  perform eventin_private.put('memberships',gen_random_uuid(),jsonb_build_object('privateEventId',k,'userId',u,'userName',(select data->>'name' from public.profiles where id=u),'userEmail',(select data->>'email' from public.profiles where id=u),'role','owner','joinedAt',now()),u,k);
 when 'addBudgetItem','addTask','createInvitation','addProposedBusinessToEvent' then
  e:=(input->>'privateEventId')::uuid;
  if not eventin_private.event_access(e,action='createInvitation') then raise exception 'No tienes acceso a este evento.' using errcode='42501'; end if;
  select data into old from public.private_events where id=e for update;
  if action='addBudgetItem' then
   if length(trim(coalesce(input->>'title','')))=0 or (input->>'estimatedPen')::numeric<0 or coalesce((input->>'confirmedPen')::numeric,0)<0 then raise exception 'Revisa el concepto y los importes.'; end if;
   d:=eventin_private.put('budget_items',k,(input-array['id','addedBy','paid'])||jsonb_build_object('paid',false,'confirmedPen',coalesce((input->>'confirmedPen')::numeric,0),'addedBy',(select data->>'name' from public.profiles where id=u)),u,e);
  elsif action='addTask' then
   if length(trim(coalesce(input->>'title','')))=0 then raise exception 'Escribe la tarea.'; end if;
   perform (input->>'dueDate')::date;
   d:=eventin_private.put('tasks',k,(input-array['id','done'])||jsonb_build_object('done',false),u,e);
  elsif action='createInvitation' then
   if coalesce(input->>'recipientEmail','') !~* '^[^ @]+@[^ @]+\.[^ @]+$' then raise exception 'Escribe un correo válido.'; end if;
   d:=eventin_private.put('invitations',k,jsonb_build_object('token',gen_random_uuid()::text||gen_random_uuid()::text,'privateEventId',e,'privateEventTitle',old->>'title','invitedByUserId',u,'invitedByName',(select data->>'name' from public.profiles where id=u),'recipientEmail',lower(trim(input->>'recipientEmail')),'recipientName',left(input->>'recipientName',120),'role','coorganizer','status','pending','expiresAt',now()+interval '7 days','createdAt',now()),u,e);
  else
   b:=(input->>'businessId')::uuid;
   if not exists(select 1 from public.businesses where id=b and eventin_private.visible(data)) then raise exception 'Proveedor no disponible.'; end if;
   if not (old->'proposedBusinessIds') ? b::text then old:=jsonb_set(old,'{proposedBusinessIds}',(old->'proposedBusinessIds')||to_jsonb(b::text)); end if;
   update public.private_events set data=old where id=e; d:=old;
  end if;
 when 'toggleBudgetItemPaid','toggleTask' then
  t:=case when action='toggleTask' then 'tasks' else 'budget_items' end;
  k:=(input->>'id')::uuid;
  execute format('select data,event_id from public.%I where id=$1 for update',t) into old,e using k;
  if old is null or not eventin_private.event_access(e) then raise exception 'No tienes acceso.' using errcode='42501'; end if;
  field:=case when action='toggleTask' then 'done' else 'paid' end;
  d:=jsonb_set(old,array[field],to_jsonb(not (old->>field)::boolean));
  execute format('update public.%I set data=$1 where id=$2',t) using d,k;
 when 'revokeInvitation','acceptInvitation' then
  if action='acceptInvitation' then select id,data,event_id into k,old,e from public.invitations where data->>'token'=input->>'token' for update;
  else select id,data,event_id into k,old,e from public.invitations where id=(input->>'id')::uuid for update; end if;
  if old is null then raise exception 'La invitación no existe.'; end if;
  if action='revokeInvitation' then
   if not eventin_private.event_access(e,true) then raise exception 'Solo el propietario administra invitaciones.' using errcode='42501'; end if;
   if old->>'status'<>'pending' then raise exception 'La invitación ya no está pendiente.'; end if;
   d:=old||'{"status":"revoked"}';
  else
   if lower(old->>'recipientEmail')<>lower((select email from auth.users where id=u)) then raise exception 'Accede con el correo destinatario.' using errcode='42501'; end if;
   if old->>'status'='accepted' and exists(select 1 from public.memberships where event_id=e and owner_id=u) then return jsonb_build_object('privateEventId',e); end if;
   if old->>'status'<>'pending' or (old->>'expiresAt')::timestamptz<=now() then raise exception 'La invitación expiró o fue revocada.'; end if;
   perform eventin_private.put('memberships',gen_random_uuid(),jsonb_build_object('privateEventId',e,'userId',u,'userName',(select data->>'name' from public.profiles where id=u),'userEmail',(select email from auth.users where id=u),'role','coorganizer','joinedAt',now()),u,e);
   d:=old||'{"status":"accepted"}';
  end if;
  update public.invitations set data=d where id=k;
  if action='acceptInvitation' then d:=jsonb_build_object('privateEventId',e); end if;
 when 'saveBusinessDraft','savePublicEventDraft' then
  t:=case when action='saveBusinessDraft' then 'businesses' else 'public_events' end;
  field:=case when action='saveBusinessDraft' then 'businessId' else 'publicEventId' end;
  if nullif(input->>field,'') is not null then
   k:=(input->>field)::uuid;
   execute format('select data,owner_id from public.%I where id=$1 for update',t) into old,o using k;
   if old is null or o<>u then raise exception 'No tienes acceso al recurso.' using errcode='42501'; end if;
  end if;
  required:=case when action='saveBusinessDraft' then array['name','category','zone','summary','description','whatsappPhone','email'] else array['title','category','zone','address','startsAt','endsAt','organizerName','summary','description','whatsappPhone'] end;
  if coalesce((input->>'submitForReview')::boolean,false) then
   foreach field in array required loop if length(trim(coalesce(input->>field,'')))=0 then raise exception 'Completa los datos antes de enviar a revisión.'; end if; end loop;
  end if;
  if action='savePublicEventDraft' then
   start_at:=nullif(input->>'startsAt','')::timestamptz; end_at:=nullif(input->>'endsAt','')::timestamptz;
   if end_at<=start_at or (input->>'entryPricePen')::numeric<0 then raise exception 'Revisa las fechas y el precio.'; end if;
  elsif coalesce((input->>'startingPricePen')::numeric,0)<0 then raise exception 'El precio no puede ser negativo.'; end if;
  -- Only editable content is copied. A client cannot approve or pay itself.
  d:=jsonb_build_object('ownerId',u,'imageUrl',coalesce(old->>'imageUrl',''),'contentStatus',case when coalesce((input->>'submitForReview')::boolean,false) then 'pending' else 'draft' end,'paymentStatus',coalesce(old->>'paymentStatus','unpaid'),'subscriptionActive',coalesce((old->>'subscriptionActive')::boolean,false),'subscriptionPeriodEnd',coalesce(old->>'subscriptionPeriodEnd','1970-01-01T00:00:00Z'),'version',coalesce((old->>'version')::int,0)+1,'mapX',coalesce((old->>'mapX')::numeric,50),'mapY',coalesce((old->>'mapY')::numeric,50));
  foreach field in array case when action='saveBusinessDraft' then array['name','category','zone','coverageZones','summary','description','startingPricePen','quoteOnly','whatsappPhone','email','availabilityNote'] else array['title','category','zone','address','startsAt','endsAt','entryPricePen','isFree','whatsappPhone','organizerName','summary','description'] end loop d:=d||jsonb_build_object(field,input->field); end loop;
  d:=eventin_private.put(t,k,d,u);
 when 'saveService' then
  b:=(input->>'businessId')::uuid;
  if not eventin_private.business_access(b) then raise exception 'No tienes acceso al negocio.' using errcode='42501'; end if;
  if nullif(input->>'serviceId','') is not null then
   k:=(input->>'serviceId')::uuid;
   if not exists(select 1 from public.services where id=k and business_id=b) then raise exception 'El servicio no pertenece a este negocio.'; end if;
  end if;
  if length(trim(coalesce(input->>'name','')))=0 or input->>'pricingMode' not in ('fixed','quote') or coalesce((input->>'pricePen')::numeric,0)<0 then raise exception 'Revisa el servicio y su precio.'; end if;
  d:=eventin_private.put('services',k,input-array['id','serviceId'],u,null,b);
 when 'createQuoteRequest' then
  e:=(input->>'privateEventId')::uuid; b:=(input->>'businessId')::uuid;
  if not eventin_private.event_access(e) then raise exception 'No tienes acceso al evento.' using errcode='42501'; end if;
  select data into other from public.businesses where id=b and eventin_private.visible(data);
  if other is null then raise exception 'Proveedor no disponible.'; end if;
  if nullif(input->>'serviceId','') is not null and not exists(select 1 from public.services where id=(input->>'serviceId')::uuid and business_id=b and (data->>'active')::boolean) then raise exception 'Servicio no disponible.'; end if;
  if (input->>'guestCount')::int<1 or (input->>'estimatedBudgetPen')::numeric<0 then raise exception 'Revisa invitados y presupuesto.'; end if;
  d:=eventin_private.put('quote_requests',k,(input-array['id','status','requesterId','requesterName','businessName','privateEventTitle','createdAt'])||jsonb_build_object('requesterId',u,'requesterName',(select data->>'name' from public.profiles where id=u),'businessName',other->>'name','privateEventTitle',(select data->>'title' from public.private_events where id=e),'status','pending','createdAt',now()),u,e,b);
 when 'saveProposalDraft' then
  r:=(input->>'requestId')::uuid;
  select data,event_id,business_id into other,e,b from public.quote_requests where id=r for update;
  if other is null or not eventin_private.business_access(b) then raise exception 'No tienes acceso a la solicitud.' using errcode='42501'; end if;
  if other->>'status' in ('closed','declined') then raise exception 'La solicitud está cerrada.'; end if;
  if (input->>'amountPen')::numeric<=0 or (input->>'expiresAt')::timestamptz<=now() then raise exception 'Revisa importe y vigencia.'; end if;
  select id,data into k,old from public.proposals where data->>'requestId'=r::text for update;
  if old is not null and old->>'status'<>'draft' then raise exception 'La propuesta ya fue enviada.'; end if;
  k:=coalesce(k,gen_random_uuid());
  d:=eventin_private.put('proposals',k,(input-array['id','status','privateEventId','businessId','businessName','createdAt'])||jsonb_build_object('privateEventId',e,'businessId',b,'businessName',other->>'businessName','status','draft','createdAt',now()),u,e,b);
 when 'sendProposal','selectProposal' then
  k:=(input->>'id')::uuid;
  select event_id into e from public.proposals where id=k;
  perform pg_advisory_xact_lock(hashtextextended(e::text,1));
  select data,business_id into old,b from public.proposals where id=k for update;
  if old is null then raise exception 'Propuesta no encontrada.'; end if;
  if action='sendProposal' then
   if not eventin_private.business_access(b) then raise exception 'No tienes acceso al negocio.' using errcode='42501'; end if;
   if old->>'status' not in ('draft','sent') or (old->>'expiresAt')::timestamptz<=now() then raise exception 'La propuesta no puede enviarse.'; end if;
   d:=old||'{"status":"sent"}';
   update public.quote_requests set data=data||'{"status":"responded"}' where id=(old->>'requestId')::uuid;
  else
   if not eventin_private.event_access(e) then raise exception 'No tienes acceso al evento.' using errcode='42501'; end if;
   if old->>'status'='selected' then return old; end if;
   if old->>'status'<>'sent' or (old->>'expiresAt')::timestamptz<=now() then raise exception 'La propuesta ya no está disponible.'; end if;
   if exists(select 1 from public.proposals where data->>'requestId'=old->>'requestId' and data->>'status'='selected') then raise exception 'Ya seleccionaste una propuesta para esta solicitud.'; end if;
   d:=old||'{"status":"selected"}';
   perform eventin_private.put('budget_items',gen_random_uuid(),jsonb_build_object('privateEventId',e,'category','Proveedor','title','Propuesta seleccionada','providerName',old->>'businessName','estimatedPen',(old->>'amountPen')::numeric,'confirmedPen',(old->>'amountPen')::numeric,'paid',false,'addedBy',(select data->>'name' from public.profiles where id=u)),u,e);
   update public.quote_requests set data=data||'{"status":"closed"}' where id=(old->>'requestId')::uuid;
  end if;
  update public.proposals set data=d where id=k;
 when 'declineQuoteRequest' then
  k:=(input->>'id')::uuid;
  select data,business_id into old,b from public.quote_requests where id=k for update;
  if old is null or not eventin_private.business_access(b) then raise exception 'No tienes acceso a la solicitud.' using errcode='42501'; end if;
  if old->>'status'<>'pending' or length(trim(coalesce(input->>'reason','')))=0 then raise exception 'La solicitud no está pendiente o falta el motivo.'; end if;
  d:=old||jsonb_build_object('status','declined','declineReason',input->>'reason'); update public.quote_requests set data=d where id=k;
 when 'toggleFavorite' then
  if input->>'kind' not in ('event','provider') then raise exception 'Tipo de favorito no válido.'; end if;
  select id into k from public.favorites where owner_id=u and data->>'kind'=input->>'kind' and data->>'id'=input->>'id';
  if k is not null then delete from public.favorites where id=k; else
   t:=case when input->>'kind'='event' then 'public_events' else 'businesses' end;
   execute format('select data from public.%I where id=$1',t) into old using (input->>'id')::uuid;
   if old is null or not eventin_private.visible(old,t='public_events') then raise exception 'El recurso no está disponible.'; end if;
   insert into public.favorites(owner_id,data) values(u,jsonb_build_object('kind',input->>'kind','id',input->>'id'));
  end if; d:='{}';
 when 'markNotificationRead','markAllNotificationsRead' then
  update public.notifications set data=data||'{"read":true}' where owner_id=u and (action='markAllNotificationsRead' or id=(input->>'id')::uuid); d:='{}';
 when 'submitPaymentProof','reviewPayment' then
  raise exception 'Los pagos están deshabilitados. La integración con Izipay está pendiente.';
 when 'moderateContent' then
  t:=case input->>'resourceKind' when 'business' then 'businesses' when 'public_event' then 'public_events' end;
  if t is null or not eventin_private.admin(case when t='businesses' then 'ADMIN_BUSINESS_REVIEW' else 'ADMIN_EVENT_REVIEW' end) then raise exception 'Sin permiso de moderación.' using errcode='42501'; end if;
  k:=(input->>'resourceId')::uuid; decision:=input->>'decision';
  if decision not in ('approved','observed','rejected','suspended') or length(trim(coalesce(input->>'reason','')))=0 then raise exception 'Selecciona decisión y motivo.'; end if;
  execute format('select data from public.%I where id=$1 for update',t) into old using k;
  if old is null then raise exception 'Recurso no encontrado.'; end if;
  if nullif(input->>'expectedVersion','') is null or (input->>'expectedVersion')::int<>(old->>'version')::int then raise exception 'El recurso cambió. Actualiza la revisión.'; end if;
  d:=old||jsonb_build_object('contentStatus',decision,'observationNote',input->>'reason','version',(old->>'version')::int+1);
  execute format('update public.%I set data=$1 where id=$2',t) using d,k;
  perform eventin_private.audit(action,input->>'resourceKind',k,old,d,input->>'reason');
 when 'toggleUserSuspension' then
  if not eventin_private.admin('ADMIN_USER_MANAGE') then raise exception 'Sin permiso para administrar cuentas.' using errcode='42501'; end if;
  k:=(input->>'userId')::uuid;
  if k=u or length(trim(coalesce(input->>'reason','')))=0 then raise exception 'Revisa cuenta y motivo.'; end if;
  select data into old from public.profiles where id=k for update;
  if old is null or (old->'adminCapabilities') ? 'ADMIN' then raise exception 'No se puede modificar esta cuenta desde aquí.'; end if;
  d:=old||jsonb_build_object('accountStatus',case when (input->>'suspend')::boolean then 'suspended' else 'active' end,'suspensionReason',input->>'reason');
  update public.profiles set data=d where id=k;
  perform eventin_private.audit(action,'user',k,old,d,input->>'reason');
 when 'resolveReport' then
  if not eventin_private.admin('ADMIN_REPORT_MANAGE') then raise exception 'Sin permiso para administrar reportes.' using errcode='42501'; end if;
  k:=(input->>'reportId')::uuid;
  select data into old from public.reports where id=k for update;
  if old is null or input->>'status' not in ('resolved','dismissed') or length(trim(coalesce(input->>'resolutionNote','')))=0 then raise exception 'Revisa el reporte y la resolución.'; end if;
  d:=old||jsonb_build_object('status',input->>'status','resolutionNote',input->>'resolutionNote'); update public.reports set data=d where id=k;
  if coalesce((input->>'suspendResource')::boolean,false) then
   t:=case old->>'resourceKind' when 'business' then 'businesses' when 'public_event' then 'public_events' end;
   execute format('update public.%I set data=data||''{"contentStatus":"suspended"}'' where id=$1',t) using (old->>'resourceId')::uuid;
  end if;
  perform eventin_private.audit(action,'report',k,old,d,input->>'resolutionNote');
 when 'updatePlatformSettings' then
  if not eventin_private.admin('ADMIN_CONFIG_MANAGE') then raise exception 'Sin permiso para configurar la plataforma.' using errcode='42501'; end if;
  -- Payments remain disabled until an audited payment-provider integration exists.
  d:=settings||jsonb_build_object('beneficiaryConfigured',false,'beneficiaryName','','beneficiaryChannel','','beneficiaryAccount','','beneficiaryNote','Pagos deshabilitados. Integración Izipay pendiente.');
  update public.platform_settings set data=d where id;
  perform eventin_private.audit(action,'settings',u,settings,d,'Configuración actualizada; pagos deshabilitados.');
 else raise exception 'Operación no admitida.';
 end case;
 return coalesce(d,'{}');
end $$;
revoke all on function eventin_private.command(text,jsonb) from public,anon;
grant execute on function eventin_private.command(text,jsonb) to authenticated;
create or replace function public.eventin_command(action text,input jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$ select eventin_private.command(action,input) $$;
revoke all on function public.eventin_command(text,jsonb) from public,anon;
grant execute on function public.eventin_command(text,jsonb) to authenticated;

-- Shared state is refreshed via explicit reads and polling. Realtime publication
-- is intentionally not used for private invitation tokens or billing documents.
