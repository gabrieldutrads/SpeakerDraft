-- ============================================================================
-- MIGRATION CORRETIVA — TAREFA 03
-- Arquivo: 20261122000000_fix_integrity_p1_p2.sql
-- 
-- Escopo: P1 (FKs) e P2 (document_tags).
-- P3 (Storage) está fora desta migration.
-- 
-- Correções aplicadas nesta revisão:
--   - Cast explícito de attname::text em todos os array_agg que comparam com
--     array de text[] (evita erro "operator does not exist: name[] = text[]").
--   - Cast explícito de confdelsetcols para smallint[] nas comparações.
--   - Nenhuma alteração na lógica de integridade, pré-validações, FKs, policy
--     RLS ou transação.
-- ============================================================================

begin;

-- ============================================================================
-- BLOCO 0 — VERIFICAÇÕES ESTRUTURAIS PRÉVIAS (via catálogos)
-- ============================================================================

-- 0.1 Versão do PostgreSQL
do $$
declare
  v_version int := current_setting('server_version_num')::int;
begin
  if v_version < 150000 then
    raise exception 'PostgreSQL >= 15 é necessário. Encontrado: %', v_version;
  end if;
end $$;

-- 0.2 Validação estrutural de documents_folder_owner_fk
do $$
declare
  v_conid          oid;
  v_contype        char;
  v_convalidated   boolean;
  v_confdeltype    char;
  v_confrelid      oid;
  v_conrelid       oid;
  v_confdelsetcols smallint[];
  v_source_cols    text[];
  v_target_cols    text[];
  v_expected_src   text[] := array['folder_id', 'owner_id'];
  v_expected_tgt   text[] := array['id', 'owner_id'];
begin
  select c.oid, c.contype, c.convalidated, c.confdeltype, c.confrelid, c.conrelid, c.confdelsetcols
    into v_conid, v_contype, v_convalidated, v_confdeltype, v_confrelid, v_conrelid, v_confdelsetcols
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_namespace n on n.oid = t.relnamespace
  where c.conname = 'documents_folder_owner_fk'
    and n.nspname = 'public'
    and t.relname = 'documents';

  if v_conid is null then
    raise exception 'documents_folder_owner_fk não encontrada em public.documents.';
  end if;

  if v_contype <> 'f' then
    raise exception 'documents_folder_owner_fk não é uma FK. contype=%', v_contype;
  end if;

  if not v_convalidated then
    raise exception 'documents_folder_owner_fk não está validada.';
  end if;

  if v_confdeltype <> 'n' then
    raise exception 'documents_folder_owner_fk não é ON DELETE SET NULL. confdeltype=%', v_confdeltype;
  end if;

  if v_confdelsetcols is not null then
    raise exception 'documents_folder_owner_fk: esperado confdelsetcols IS NULL, encontrado %.', v_confdelsetcols;
  end if;

  if v_confrelid <> 'public.folders'::regclass then
    raise exception 'documents_folder_owner_fk: tabela de destino inesperada (OID %).', v_confrelid;
  end if;

  -- attname é name; cast para text antes do array_agg
  select array_agg(a.attname::text order by k.ord)
    into v_source_cols
  from unnest(
    (select conkey from pg_constraint where oid = v_conid)
  ) with ordinality as k(attnum, ord)
  join pg_attribute a on a.attrelid = v_conrelid and a.attnum = k.attnum;

  select array_agg(a.attname::text order by k.ord)
    into v_target_cols
  from unnest(
    (select confkey from pg_constraint where oid = v_conid)
  ) with ordinality as k(attnum, ord)
  join pg_attribute a on a.attrelid = v_confrelid and a.attnum = k.attnum;

  if v_source_cols <> v_expected_src then
    raise exception 'documents_folder_owner_fk: colunas de origem inesperadas. Encontrado %, esperado %.',
      v_source_cols, v_expected_src;
  end if;

  if v_target_cols <> v_expected_tgt then
    raise exception 'documents_folder_owner_fk: colunas de destino inesperadas. Encontrado %, esperado %.',
      v_target_cols, v_expected_tgt;
  end if;
end $$;

-- 0.3 Validação estrutural de events_document_owner_fk
do $$
declare
  v_conid          oid;
  v_contype        char;
  v_convalidated   boolean;
  v_confdeltype    char;
  v_confrelid      oid;
  v_conrelid       oid;
  v_confdelsetcols smallint[];
  v_source_cols    text[];
  v_target_cols    text[];
  v_expected_src   text[] := array['document_id', 'owner_id'];
  v_expected_tgt   text[] := array['id', 'owner_id'];
begin
  select c.oid, c.contype, c.convalidated, c.confdeltype, c.confrelid, c.conrelid, c.confdelsetcols
    into v_conid, v_contype, v_convalidated, v_confdeltype, v_confrelid, v_conrelid, v_confdelsetcols
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_namespace n on n.oid = t.relnamespace
  where c.conname = 'events_document_owner_fk'
    and n.nspname = 'public'
    and t.relname = 'events';

  if v_conid is null then
    raise exception 'events_document_owner_fk não encontrada em public.events.';
  end if;

  if v_contype <> 'f' then
    raise exception 'events_document_owner_fk não é uma FK. contype=%', v_contype;
  end if;

  if not v_convalidated then
    raise exception 'events_document_owner_fk não está validada.';
  end if;

  if v_confdeltype <> 'n' then
    raise exception 'events_document_owner_fk não é ON DELETE SET NULL. confdeltype=%', v_confdeltype;
  end if;

  if v_confdelsetcols is not null then
    raise exception 'events_document_owner_fk: esperado confdelsetcols IS NULL, encontrado %.', v_confdelsetcols;
  end if;

  if v_confrelid <> 'public.documents'::regclass then
    raise exception 'events_document_owner_fk: tabela de destino inesperada (OID %).', v_confrelid;
  end if;

  select array_agg(a.attname::text order by k.ord)
    into v_source_cols
  from unnest(
    (select conkey from pg_constraint where oid = v_conid)
  ) with ordinality as k(attnum, ord)
  join pg_attribute a on a.attrelid = v_conrelid and a.attnum = k.attnum;

  select array_agg(a.attname::text order by k.ord)
    into v_target_cols
  from unnest(
    (select confkey from pg_constraint where oid = v_conid)
  ) with ordinality as k(attnum, ord)
  join pg_attribute a on a.attrelid = v_confrelid and a.attnum = k.attnum;

  if v_source_cols <> v_expected_src then
    raise exception 'events_document_owner_fk: colunas de origem inesperadas. Encontrado %, esperado %.',
      v_source_cols, v_expected_src;
  end if;

  if v_target_cols <> v_expected_tgt then
    raise exception 'events_document_owner_fk: colunas de destino inesperadas. Encontrado %, esperado %.',
      v_target_cols, v_expected_tgt;
  end if;
end $$;

-- 0.4 Verificar se tags NÃO possui UNIQUE (id, owner_id)
do $$
declare
  v_has_unique boolean;
begin
  select exists (
    select 1 from pg_constraint c
    where c.conrelid = 'public.tags'::regclass
      and c.contype = 'u'
      and (
        select array_agg(a.attname::text order by k.ord)
        from unnest(c.conkey) with ordinality as k(attnum, ord)
        join pg_attribute a on a.attrelid = c.conrelid and a.attnum = k.attnum
      ) = array['id', 'owner_id']
  ) into v_has_unique;

  if v_has_unique then
    raise exception 'tags já possui UNIQUE (id, owner_id). Migration não deve recriá-la.';
  end if;
end $$;

-- 0.5 Verificar inconsistências em document_tags SEM MODIFICAR
do $$
declare
  v_total       int;
  v_bad_doc     int;
  v_bad_tag     int;
  v_orphan_doc  int;
  v_orphan_tag  int;
begin
  select count(*) into v_total from public.document_tags;

  select count(*) into v_bad_doc
  from public.document_tags dt
  join public.documents d on d.id = dt.document_id
  where d.owner_id <> dt.owner_id;

  select count(*) into v_bad_tag
  from public.document_tags dt
  join public.tags t on t.id = dt.tag_id
  where t.owner_id <> dt.owner_id;

  select count(*) into v_orphan_doc
  from public.document_tags dt
  left join public.documents d on d.id = dt.document_id
  where d.id is null;

  select count(*) into v_orphan_tag
  from public.document_tags dt
  left join public.tags t on t.id = dt.tag_id
  where t.id is null;

  if v_bad_doc > 0 or v_bad_tag > 0 or v_orphan_doc > 0 or v_orphan_tag > 0 then
    raise exception 'Inconsistências detectadas em document_tags (total=%, bad_doc=%, bad_tag=%, orphan_doc=%, orphan_tag=%). Corrija manualmente antes de reaplicar.',
      v_total, v_bad_doc, v_bad_tag, v_orphan_doc, v_orphan_tag;
  end if;
end $$;

-- ============================================================================
-- BLOCO 1 — CORREÇÃO DAS FKs P1
-- ============================================================================

-- 1.1 documents_folder_owner_fk
alter table public.documents
  drop constraint documents_folder_owner_fk;

alter table public.documents
  add constraint documents_folder_owner_fk
  foreign key (folder_id, owner_id)
  references public.folders (id, owner_id)
  on delete set null (folder_id);

-- 1.2 events_document_owner_fk
alter table public.events
  drop constraint events_document_owner_fk;

alter table public.events
  add constraint events_document_owner_fk
  foreign key (document_id, owner_id)
  references public.documents (id, owner_id)
  on delete set null (document_id);

-- ============================================================================
-- BLOCO 2 — P2: document_tags
-- ============================================================================

-- 2.1 UNIQUE (id, owner_id) em tags
alter table public.tags
  add constraint tags_id_owner_key unique (id, owner_id);

-- 2.2 FKs compostas em document_tags
alter table public.document_tags
  add constraint document_tags_document_owner_fk
  foreign key (document_id, owner_id)
  references public.documents (id, owner_id)
  on delete cascade;

alter table public.document_tags
  add constraint document_tags_tag_owner_fk
  foreign key (tag_id, owner_id)
  references public.tags (id, owner_id)
  on delete cascade;

-- 2.3 Policy de INSERT reforçada
drop policy if exists "document_tags_insert_own" on public.document_tags;
create policy "document_tags_insert_own"
on public.document_tags for insert to authenticated
with check (
  auth.uid() = owner_id
  and exists (
    select 1 from public.documents d
    where d.id = document_id and d.owner_id = auth.uid()
  )
  and exists (
    select 1 from public.tags t
    where t.id = tag_id and t.owner_id = auth.uid()
  )
);

commit;
