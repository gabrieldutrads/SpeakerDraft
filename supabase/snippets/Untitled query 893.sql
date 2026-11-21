-- ============================================================================
-- MIGRATION CORRETIVA — TAREFA 03
-- Arquivo: 20261122000000_fix_integrity_p1_p2.sql
-- 
-- Escopo:
--   P1 — Correção das FKs compostas de documents e events
--   P2 — Integridade relacional de document_tags + policy INSERT
-- 
-- Fora de escopo (proposta separada):
--   P3 — Configuração de limites do bucket pdfs
-- 
-- Princípios:
--   - Nenhuma exclusão, atualização ou correção automática de registros.
--   - Interrupção explícita se inconsistências forem detectadas.
--   - Validação estrutural das constraints via catálogo (não por nome).
--   - Compatível com PostgreSQL 15+.
-- ============================================================================

begin;

-- ============================================================================
-- BLOCO 0 — VERIFICAÇÕES ESTRUTURAIS PRÉVIAS
-- ============================================================================

-- 0.1 Versão do PostgreSQL (>= 15)
do $$
declare
  v_version int := current_setting('server_version_num')::int;
begin
  if v_version < 150000 then
    raise exception 'PostgreSQL >= 15 é necessário. Encontrado: %', v_version;
  end if;
end $$;

-- 0.2 Verificar definição estrutural de documents_folder_owner_fk
--     (colunas participantes, tabela referenciada, ação de exclusão)
do $$
declare
  v_condef       text;
  v_convalidated boolean;
  v_action       char;
begin
  select pg_get_constraintdef(c.oid, true), c.convalidated, c.confdeltype
    into v_condef, v_convalidated, v_action
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_namespace n on n.oid = t.relnamespace
  where c.conname = 'documents_folder_owner_fk'
    and n.nspname = 'public'
    and t.relname = 'documents';

  if v_condef is null then
    raise exception 'documents_folder_owner_fk não encontrada em public.documents.';
  end if;

  -- Deve ser: FK (folder_id, owner_id) -> folders(id, owner_id) ON DELETE SET NULL
  if position('FOREIGN KEY (folder_id, owner_id)' in v_condef) = 0
     or position('REFERENCES folders(id, owner_id)' in v_condef) = 0
     or v_action <> 'n'   -- 'n' = SET NULL
  then
    raise exception 'Definição inesperada de documents_folder_owner_fk: % (confdeltype=%)', v_condef, v_action;
  end if;

  if not v_convalidated then
    raise exception 'documents_folder_owner_fk não está validada. Estado inesperado.';
  end if;
end $$;

-- 0.3 Verificar definição estrutural de events_document_owner_fk
do $$
declare
  v_condef       text;
  v_convalidated boolean;
  v_action       char;
begin
  select pg_get_constraintdef(c.oid, true), c.convalidated, c.confdeltype
    into v_condef, v_convalidated, v_action
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_namespace n on n.oid = t.relnamespace
  where c.conname = 'events_document_owner_fk'
    and n.nspname = 'public'
    and t.relname = 'events';

  if v_condef is null then
    raise exception 'events_document_owner_fk não encontrada em public.events.';
  end if;

  if position('FOREIGN KEY (document_id, owner_id)' in v_condef) = 0
     or position('REFERENCES documents(id, owner_id)' in v_condef) = 0
     or v_action <> 'n'
  then
    raise exception 'Definição inesperada de events_document_owner_fk: % (confdeltype=%)', v_condef, v_action;
  end if;

  if not v_convalidated then
    raise exception 'events_document_owner_fk não está validada. Estado inesperado.';
  end if;
end $$;

-- 0.4 Verificar se tags NÃO possui UNIQUE (id, owner_id) ainda
--     (evidência do diagnóstico: não existe)
do $$
declare
  v_has_unique boolean;
begin
  select exists (
    select 1 from pg_constraint c
    where c.conrelid = 'public.tags'::regclass
      and c.contype = 'u'
      and (
        select array_agg(a.attname order by a.attnum)
        from unnest(c.conkey) as k(attnum)
        join pg_attribute a on a.attrelid = c.conrelid and a.attnum = k.attnum
      ) = array['id','owner_id']
  ) into v_has_unique;

  if v_has_unique then
    raise exception 'tags já possui UNIQUE (id, owner_id). Migration não deve recriá-la.';
  end if;
end $$;

-- 0.5 Verificar inconsistências em document_tags SEM MODIFICAR
--     (evidência do diagnóstico: 0 registros, mas mantemos a guarda)
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

-- 2.1 Criar UNIQUE (id, owner_id) em tags
alter table public.tags
  add constraint tags_id_owner_key unique (id, owner_id);

-- 2.2 Adicionar FKs compostas em document_tags
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

-- 2.3 Reforçar policy INSERT de document_tags
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