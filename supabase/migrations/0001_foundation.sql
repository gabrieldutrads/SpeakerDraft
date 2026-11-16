-- ============================================================================
-- 0001_foundation.sql
-- oPregador (projeto: speaker-draft)
-- Fundação: extensões, schema de helpers e função genérica de updated_at.
-- Não cria tabelas de domínio. Apenas o alicerce.
-- ============================================================================

-- Extensões necessárias
create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "pg_trgm";       -- busca por similaridade (plain_text)

-- Schema dedicado a funções internas (não exposto na API)
create schema if not exists app_private;

-- Restringe o schema a funções; nada é exposto via PostgREST
revoke all on schema app_private from public;
grant usage on schema app_private to postgres, service_role;

-- ----------------------------------------------------------------------------
-- Função: app_private.set_updated_at()
-- Uso: trigger BEFORE UPDATE em tabelas que possuem coluna updated_at.
-- Responsabilidade: atualizar updated_at para now() a cada UPDATE.
-- ----------------------------------------------------------------------------
create or replace function app_private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function app_private.set_updated_at() is
  'Trigger BEFORE UPDATE: atualiza updated_at para now().';