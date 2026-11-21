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