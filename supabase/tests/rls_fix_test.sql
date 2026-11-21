-- ============================================================================
-- Testes pgTAP — RLS e Integridade P1/P2 (Tarefa 03) — VERSÃO AUDITADA (Tarefa 04)
-- Arquivo: supabase/tests/rls_fix_test.sql
-- Correções: throws_ok reduzido para assinatura de 2 argumentos (SQLSTATE apenas)
--           confrelid explicitamente convertido para regclass
-- ============================================================================

begin;

set local search_path = pg_catalog, extensions;

select plan(27);

-- ============================================================================
-- FIXTURES
-- ============================================================================
do $$
declare
  v_user_a uuid;
  v_user_b uuid;
  v_folder_a uuid;
  v_doc_a uuid;
  v_doc_b uuid;
  v_tag_a uuid;
  v_tag_b uuid;
  v_evt_a uuid;
  v_doc_a2 uuid;
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data
  ) values (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(), 'authenticated', 'authenticated',
    'a+' || gen_random_uuid() || '@test.local',
    'x', now(), now(), now(), '{}', '{"full_name":"User A"}'
  ) returning id into v_user_a;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data
  ) values (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(), 'authenticated', 'authenticated',
    'b+' || gen_random_uuid() || '@test.local',
    'x', now(), now(), now(), '{}', '{"full_name":"User B"}'
  ) returning id into v_user_b;

  perform set_config('test.user_a', v_user_a::text, true);
  perform set_config('test.user_b', v_user_b::text, true);

  insert into public.folders (id, owner_id, name)
  values (gen_random_uuid(), v_user_a, 'Pasta A')
  returning id into v_folder_a;

  insert into public.documents (id, owner_id, title, folder_id)
  values (gen_random_uuid(), v_user_a, 'Doc A', v_folder_a)
  returning id into v_doc_a;

  insert into public.documents (id, owner_id, title)
  values (gen_random_uuid(), v_user_b, 'Doc B')
  returning id into v_doc_b;

  insert into public.tags (id, owner_id, name)
  values (gen_random_uuid(), v_user_a, 'Tag A')
  returning id into v_tag_a;

  insert into public.tags (id, owner_id, name)
  values (gen_random_uuid(), v_user_b, 'Tag B')
  returning id into v_tag_b;

  insert into public.events (id, owner_id, title, date, time, document_id)
  values (gen_random_uuid(), v_user_a, 'Evento A', '2026-12-01', '19:00', v_doc_a)
  returning id into v_evt_a;

  insert into public.documents (id, owner_id, title)
  values (gen_random_uuid(), v_user_a, 'Doc A2')
  returning id into v_doc_a2;

  perform set_config('test.doc_a', v_doc_a::text, true);
  perform set_config('test.doc_b', v_doc_b::text, true);
  perform set_config('test.tag_a', v_tag_a::text, true);
  perform set_config('test.tag_b', v_tag_b::text, true);
  perform set_config('test.evt_a', v_evt_a::text, true);
  perform set_config('test.doc_a2', v_doc_a2::text, true);
end $$;

-- ============================================================================
-- CONTEXTO USUÁRIO A
-- ============================================================================
select set_config('request.jwt.claim.sub', current_setting('test.user_a'), true);
select set_config('request.jwt.claims', json_build_object('sub', current_setting('test.user_a'))::text, true);
set local role authenticated;

-- ============================================================================
-- TESTE 1 — Autenticação e RLS (3)
-- ============================================================================
select is(auth.uid(), current_setting('test.user_a')::uuid, 'auth.uid() deve ser o usuário A');
select is(current_user, 'authenticated', 'current_user deve ser authenticated');
select is(
  (select relrowsecurity from pg_catalog.pg_class
   where relname = 'documents' and relnamespace = 'public'::regnamespace),
  true, 'RLS deve estar habilitado em documents'
);

-- ============================================================================
-- TESTE 2 — Exclusão de pasta preserva documents.owner_id (3)
-- ============================================================================
-- Requer policy DELETE em public.folders permitindo owner_id = auth.uid()
delete from public.folders where owner_id = current_setting('test.user_a')::uuid;

select is(
  (select count(*) from public.documents where id = current_setting('test.doc_a')::uuid),
  1::bigint, 'Doc A deve continuar existindo após exclusão da pasta'
);

select ok(
  (select folder_id from public.documents where id = current_setting('test.doc_a')::uuid) is null,
  'folder_id de Doc A deve ser NULL após exclusão da pasta'
);

select is(
  (select owner_id from public.documents where id = current_setting('test.doc_a')::uuid),
  current_setting('test.user_a')::uuid,
  'owner_id de Doc A deve ser preservado'
);

-- ============================================================================
-- TESTE 3 — Exclusão de documento preserva events.owner_id (3)
-- ============================================================================
-- Requer policy DELETE em public.documents permitindo owner_id = auth.uid()
delete from public.documents where id = current_setting('test.doc_a')::uuid;

select is(
  (select count(*) from public.events where id = current_setting('test.evt_a')::uuid),
  1::bigint, 'Evento A deve continuar existindo após exclusão do documento'
);

select ok(
  (select document_id from public.events where id = current_setting('test.evt_a')::uuid) is null,
  'document_id de Evento A deve ser NULL após exclusão do documento'
);

select is(
  (select owner_id from public.events where id = current_setting('test.evt_a')::uuid),
  current_setting('test.user_a')::uuid,
  'owner_id de Evento A deve ser preservado'
);

-- ============================================================================
-- TESTE 4 — Associação válida em document_tags (1)
-- ============================================================================
insert into public.document_tags (document_id, tag_id, owner_id)
values (
  current_setting('test.doc_a2')::uuid,
  current_setting('test.tag_a')::uuid,
  current_setting('test.user_a')::uuid
);

select is(
  (select count(*) from public.document_tags where owner_id = current_setting('test.user_a')::uuid),
  1::bigint, 'Associação válida entre Doc A2 e Tag A deve existir'
);

-- ============================================================================
-- TESTE 5 — FK composta rejeita associação (1)
-- ============================================================================
reset role;

select throws_ok(
  format(
    'insert into public.document_tags (document_id, tag_id, owner_id) values (%L, %L, %L)',
    current_setting('test.doc_a2'),
    current_setting('test.tag_b'),
    current_setting('test.user_a')
  ),
  '23503'
);

select set_config('request.jwt.claim.sub', current_setting('test.user_a'), true);
select set_config('request.jwt.claims', json_build_object('sub', current_setting('test.user_a'))::text, true);
set local role authenticated;

-- ============================================================================
-- TESTE 6 — Policy INSERT rejeita owner_id diferente (1)
-- ============================================================================
select throws_ok(
  format(
    'insert into public.document_tags (document_id, tag_id, owner_id) values (%L, %L, %L)',
    current_setting('test.doc_a2'),
    current_setting('test.tag_a'),
    current_setting('test.user_b')
  ),
  '42501'
);

-- ============================================================================
-- TESTE 7 — Policy SELECT impede visualizar registros (1)
-- ============================================================================
select is_empty(
  format('select * from public.documents where owner_id = %L', current_setting('test.user_b')),
  'A não deve ler documentos de B'
);

-- ============================================================================
-- TESTE 8 — UPDATE em documento de B afeta zero linhas (2)
-- ============================================================================
with affected as (
  update public.documents
  set title = 'hack'
  where owner_id = current_setting('test.user_b')::uuid
  returning 1
)
select is(
  (select count(*) from affected),
  0::bigint, 'UPDATE de A em documentos de B deve afetar 0 linhas'
);

reset role;
select is(
  (select title from public.documents where id = current_setting('test.doc_b')::uuid),
  'Doc B', 'Título de Doc B permanece inalterado'
);

select set_config('request.jwt.claim.sub', current_setting('test.user_a'), true);
select set_config('request.jwt.claims', json_build_object('sub', current_setting('test.user_a'))::text, true);
set local role authenticated;

-- ============================================================================
-- TESTE 9 — DELETE em documento de B afeta zero linhas (2)
-- ============================================================================
with affected as (
  delete from public.documents
  where owner_id = current_setting('test.user_b')::uuid
  returning 1
)
select is(
  (select count(*) from affected),
  0::bigint, 'DELETE de A em documentos de B deve afetar 0 linhas'
);

reset role;
select is(
  (select count(*) from public.documents where id = current_setting('test.doc_b')::uuid),
  1::bigint, 'Doc B deve continuar existindo após tentativa de exclusão por A'
);

-- ============================================================================
-- TESTE 10 — Acesso anônimo negado (2)
-- ============================================================================
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '', true);
set local role anon;

select is(current_user, 'anon', 'current_user deve ser anon');
select is_empty('select * from public.documents', 'Anônimo não acessa documentos');

-- ============================================================================
-- TESTE 11 — Verificação estrutural das constraints (6)
-- ============================================================================
reset role;

select is(
  (select confdelsetcols from pg_catalog.pg_constraint
   where conname = 'documents_folder_owner_fk'
     and conrelid = 'public.documents'::regclass),
  (select array_agg(attnum order by attnum)::smallint[] from pg_catalog.pg_attribute
   where attrelid = 'public.documents'::regclass and attname = 'folder_id'),
  'documents_folder_owner_fk: confdelsetcols deve referenciar folder_id'
);

select is(
  (select confdeltype from pg_catalog.pg_constraint
   where conname = 'documents_folder_owner_fk'
     and conrelid = 'public.documents'::regclass),
  'n',
  'documents_folder_owner_fk: confdeltype deve ser SET NULL (''n'')'
);

select is(
  (select confdelsetcols from pg_catalog.pg_constraint
   where conname = 'events_document_owner_fk'
     and conrelid = 'public.events'::regclass),
  (select array_agg(attnum order by attnum)::smallint[] from pg_catalog.pg_attribute
   where attrelid = 'public.events'::regclass and attname = 'document_id'),
  'events_document_owner_fk: confdelsetcols deve referenciar document_id'
);

select is(
  (select confdeltype from pg_catalog.pg_constraint
   where conname = 'events_document_owner_fk'
     and conrelid = 'public.events'::regclass),
  'n',
  'events_document_owner_fk: confdeltype deve ser SET NULL (''n'')'
);

select is(
  (select confrelid::regclass
   from pg_catalog.pg_constraint
   where conname = 'documents_folder_owner_fk'
     and conrelid = 'public.documents'::regclass),
  'public.folders'::regclass,
  'documents_folder_owner_fk: referência deve ser public.folders'
);

select is(
  (select confrelid::regclass
   from pg_catalog.pg_constraint
   where conname = 'events_document_owner_fk'
     and conrelid = 'public.events'::regclass),
  'public.documents'::regclass,
  'events_document_owner_fk: referência deve ser public.documents'
);

-- ============================================================================
-- TESTE 12 — Integridade de P2 (2)
-- ============================================================================
select is(
  (select count(*) from pg_catalog.pg_constraint
   where conrelid = 'public.document_tags'::regclass
     and conname in ('document_tags_document_owner_fk', 'document_tags_tag_owner_fk')),
  2::bigint, 'document_tags deve ter 2 FKs compostas'
);

select is(
  (select count(*) from pg_catalog.pg_constraint
   where conrelid = 'public.tags'::regclass
     and conname = 'tags_id_owner_key'),
  1::bigint, 'tags deve ter UNIQUE (id, owner_id)'
);

select * from finish();
rollback;