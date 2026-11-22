-- Run with a privileged SQL test connection. Every fixture is rolled back.
begin;
create temporary table eventin_test_users(label text primary key,id uuid default gen_random_uuid(),email text);
insert into eventin_test_users(label,email) values ('owner','eventin-owner@example.invalid'),('friend','eventin-friend@example.invalid'),('provider','eventin-provider@example.invalid'),('stranger','eventin-stranger@example.invalid'),('admin','eventin-admin@example.invalid');
insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) select id,email,now(),jsonb_build_object('name',label) from eventin_test_users;
grant select on eventin_test_users to authenticated,anon;
set local role authenticated;
select set_config('request.jwt.claims',(select jsonb_build_object('sub',id,'email',email,'role','authenticated')::text from eventin_test_users where label='owner'),true);
do $$ declare d jsonb; i jsonb; bad boolean:=false; begin
 if jsonb_array_length(public.eventin_snapshot()->'users')<>1 then raise exception 'FAIL profile isolation'; end if;
 d:=public.eventin_command('createPrivateEvent',jsonb_build_object('title','RLS test event','celebrationType','Cumpleaños','eventDate',(current_date+30)::text,'zone','Lima','guestCount',25,'targetBudgetPen',1000,'notes',''));
 perform set_config('test.event_id',d->>'id',true);
 perform public.eventin_command('addTask',jsonb_build_object('privateEventId',d->>'id','title','Test task','assigneeName','Owner','dueDate',(current_date+20)::text));
 perform public.eventin_command('addBudgetItem',jsonb_build_object('privateEventId',d->>'id','category','Local','title','Test budget','estimatedPen',100));
 i:=public.eventin_command('createInvitation',jsonb_build_object('privateEventId',d->>'id','recipientEmail','eventin-friend@example.invalid','recipientName','Friend'));
 perform set_config('test.token',i->>'token',true);
 begin perform public.eventin_command('updatePlatformSettings','{}'); exception when insufficient_privilege then bad:=true; end;
 if not bad then raise exception 'FAIL admin escalation'; end if;
end $$;
select set_config('request.jwt.claims',(select jsonb_build_object('sub',id,'email',email,'role','authenticated')::text from eventin_test_users where label='stranger'),true);
do $$ declare denied boolean:=false; begin
 if exists(select 1 from public.private_events) or exists(select 1 from public.tasks) or exists(select 1 from public.budget_items) or exists(select 1 from public.invitations) then raise exception 'FAIL unrelated account reads'; end if;
 begin perform public.eventin_command('addTask',jsonb_build_object('privateEventId',current_setting('test.event_id'),'title','Forbidden','dueDate',current_date::text)); exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'FAIL unrelated account write'; end if;
 denied:=false;
 begin perform public.eventin_command('acceptInvitation',jsonb_build_object('token',current_setting('test.token'))); exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'FAIL invitation recipient'; end if;
 denied:=false;
 begin update public.profiles set data=data||'{"adminCapabilities":["ADMIN"]}'; exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'FAIL direct profile escalation'; end if;
end $$;
select set_config('request.jwt.claims',(select jsonb_build_object('sub',id,'email',email,'role','authenticated')::text from eventin_test_users where label='friend'),true);
do $$ declare d jsonb; task uuid; denied boolean:=false; begin
 if exists(select 1 from public.private_events) then raise exception 'FAIL pending invitation grants access'; end if;
 d:=public.eventin_command('acceptInvitation',jsonb_build_object('token',current_setting('test.token')));
 if (d->>'privateEventId')<>current_setting('test.event_id') then raise exception 'FAIL acceptance result'; end if;
 if not exists(select 1 from public.private_events) or not exists(select 1 from public.budget_items) then raise exception 'FAIL shared read'; end if;
 select id into task from public.tasks limit 1;
 perform public.eventin_command('toggleTask',jsonb_build_object('id',task));
 if not (select (data->>'done')::boolean from public.tasks where id=task) then raise exception 'FAIL shared task write'; end if;
 begin perform public.eventin_command('createInvitation',jsonb_build_object('privateEventId',current_setting('test.event_id'),'recipientEmail','third@example.invalid')); exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'FAIL coorganizer owner access'; end if;
end $$;
select set_config('request.jwt.claims',(select jsonb_build_object('sub',id,'email',email,'role','authenticated')::text from eventin_test_users where label='provider'),true);
do $$ declare d jsonb; begin
 d:=public.eventin_command('saveBusinessDraft','{"name":"Test provider","category":"Catering","zone":"Lima","coverageZones":["Lima"],"summary":"Summary","description":"Description","startingPricePen":100,"quoteOnly":false,"whatsappPhone":"999999999","email":"provider@example.invalid","availabilityNote":"Confirmar","submitForReview":true,"paymentStatus":"verified","subscriptionActive":true,"contentStatus":"approved"}');
 if d->>'contentStatus'<>'pending' or d->>'paymentStatus'<>'unpaid' or (d->>'subscriptionActive')::boolean then raise exception 'FAIL client controls approval/payment'; end if;
 perform set_config('test.business_id',d->>'id',true);
end $$;
reset role;
-- Test-only visibility setup simulates a future verified provider payment.
update public.businesses set data=data||jsonb_build_object('contentStatus','approved','paymentStatus','verified','subscriptionActive',true,'subscriptionPeriodEnd',now()+interval '1 month') where id=current_setting('test.business_id')::uuid;
set local role anon;
select set_config('request.jwt.claims','{}',true);
do $$ begin
 if (select count(*) from public.businesses)<>1 then raise exception 'FAIL approved public provider'; end if;
 if jsonb_array_length(public.eventin_snapshot()->'privateEvents')<>0 then raise exception 'FAIL anon private state'; end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claims',(select jsonb_build_object('sub',id,'email',email,'role','authenticated')::text from eventin_test_users where label='owner'),true);
do $$ declare d jsonb; begin
 d:=public.eventin_command('createQuoteRequest',jsonb_build_object('privateEventId',current_setting('test.event_id'),'businessId',current_setting('test.business_id'),'serviceName','Catering','eventDate',(current_date+30)::text,'guestCount',25,'zone','Lima','estimatedBudgetPen',500,'message','Test request'));
 perform set_config('test.request_id',d->>'id',true);
end $$;
select set_config('request.jwt.claims',(select jsonb_build_object('sub',id,'email',email,'role','authenticated')::text from eventin_test_users where label='provider'),true);
do $$ declare d jsonb; begin
 if (select count(*) from public.quote_requests)<>1 then raise exception 'FAIL provider request visibility'; end if;
 if not exists(select 1 from public.notifications) then raise exception 'FAIL provider notification'; end if;
 d:=public.eventin_command('saveProposalDraft',jsonb_build_object('requestId',current_setting('test.request_id'),'amountPen',450,'inclusions',jsonb_build_array('Servicio'),'exclusions','[]'::jsonb,'conditions','Confirmar disponibilidad','expiresAt',now()+interval '7 days'));
 perform set_config('test.proposal_id',d->>'id',true);
end $$;
select set_config('request.jwt.claims',(select jsonb_build_object('sub',id,'email',email,'role','authenticated')::text from eventin_test_users where label='owner'),true);
do $$ begin if exists(select 1 from public.proposals) then raise exception 'FAIL draft proposal leaked'; end if; end $$;
select set_config('request.jwt.claims',(select jsonb_build_object('sub',id,'email',email,'role','authenticated')::text from eventin_test_users where label='provider'),true);
select public.eventin_command('sendProposal',jsonb_build_object('id',current_setting('test.proposal_id')))->>'status' as sent_status;
select set_config('request.jwt.claims',(select jsonb_build_object('sub',id,'email',email,'role','authenticated')::text from eventin_test_users where label='owner'),true);
do $$ declare d jsonb; begin
 d:=public.eventin_command('selectProposal',jsonb_build_object('id',current_setting('test.proposal_id')));
 perform public.eventin_command('selectProposal',jsonb_build_object('id',current_setting('test.proposal_id')));
 if (select count(*) from public.budget_items)<>2 then raise exception 'FAIL idempotent selection'; end if;
 if d->>'status'<>'selected' then raise exception 'FAIL select proposal'; end if;
 begin perform public.eventin_command('submitPaymentProof','{}'); raise exception 'FAIL payments enabled'; exception when raise_exception then if sqlerrm='FAIL payments enabled' then raise; end if; end;
end $$;
reset role;
update eventin_private.admin_bootstrap set token_hash=encode(extensions.digest('transaction-only-test-code','sha256'),'hex'),claimed_by=null,claimed_at=null where id;
set local role authenticated;
select set_config('request.jwt.claims',(select jsonb_build_object('sub',id,'email',email,'role','authenticated')::text from eventin_test_users where label='admin'),true);
select public.eventin_claim_admin('transaction-only-test-code') as claimed_in_transaction;
do $$ declare denied boolean:=false; d jsonb; begin
 begin perform public.eventin_claim_admin('transaction-only-test-code'); exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'FAIL bootstrap reused'; end if;
 d:=public.eventin_command('moderateContent',jsonb_build_object('resourceKind','business','resourceId',current_setting('test.business_id'),'decision','observed','reason','Test review','expectedVersion',1));
 if d->>'contentStatus'<>'observed' then raise exception 'FAIL moderation'; end if;
 if not exists(select 1 from public.audit_log) then raise exception 'FAIL audit'; end if;
end $$;
reset role;
rollback;
select 'PASS: isolation, collaboration, invitation recipient, role escalation, quotes, idempotency, payment lock, moderation, audit and single-use activation; all fixtures rolled back' as result;
