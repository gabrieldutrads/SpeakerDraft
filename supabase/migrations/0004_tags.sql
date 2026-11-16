-- ============================================================================
-- 0004_tags.sql
-- oPregador (projeto: speaker-draft)
-- Tabela tags: etiquetas livres por usuário.
-- Unicidade case-insensitive por owner. RLS completa.
-- ============================================================================

create table if not exists public.tags (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users(id) on delete cascade,
  name       text not null check (length(trim(name)) > 0),
  color      text,
  created_at timestamptz not null default now()
);

comment on table public.tags is
  'Etiquetas livres do usuário, reutilizáveis em documentos e itens da biblioteca.';

-- Índice para performance
create index if not exists tags_owner_idx on public.tags (owner_id);

-- Unicidade: não permite duas tags com o mesmo nome (case-insensitive) para o mesmo dono.
create unique index if not exists tags_owner_name_uniq
  on public.tags (owner_id, lower(name));

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
alter table public.tags enable row level security;

drop policy if exists "tags_select_own" on public.tags;
create policy "tags_select_own"
on public.tags for select to authenticated
using (auth.uid() = owner_id);

drop policy if exists "tags_insert_own" on public.tags;
create policy "tags_insert_own"
on public.tags for insert to authenticated
with check (auth.uid() = owner_id);

drop policy if exists "tags_update_own" on public.tags;
create policy "tags_update_own"
on public.tags for update to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "tags_delete_own" on public.tags;
create policy "tags_delete_own"
on public.tags for delete to authenticated
using (auth.uid() = owner_id);