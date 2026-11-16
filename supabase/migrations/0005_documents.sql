-- ============================================================================
-- 0005_documents.sql
-- Tabela principal de documentos/esboços. Suporta conteúdo ProseMirror (JSONB).
-- ============================================================================

create table if not exists public.documents (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references auth.users(id) on delete cascade,
  folder_id        uuid references public.folders(id) on delete set null,
  kind             text not null default 'sermon' check (kind in ('sermon', 'teaching', 'devotional', 'study_note', 'quick_note')),
  status           text not null default 'draft' check (status in ('draft', 'in_progress', 'ready', 'archived')),
  title            text not null default 'Sem título',
  bible_references text[] not null default '{}',
  tags             text[] not null default '{}',
  content          jsonb not null default '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  plain_text       text not null default '',
  duration_minutes integer check (duration_minutes > 0),
  preached_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.documents is 'Documentos (esboços, estudos, notas). O conteúdo rico fica em JSONB (ProseMirror).';

-- Índices básicos
create index if not exists documents_owner_idx on public.documents (owner_id);
create index if not exists documents_owner_folder_idx on public.documents (owner_id, folder_id);
create index if not exists documents_owner_status_idx on public.documents (owner_id, status);

-- Índices GIN para buscas rápidas
create index if not exists documents_plain_text_trgm_idx on public.documents using gin (plain_text gin_trgm_ops);
create index if not exists documents_bible_refs_idx on public.documents using gin (bible_references);
create index if not exists documents_tags_idx on public.documents using gin (tags);

-- Trigger updated_at
drop trigger if exists set_documents_updated_at on public.documents;
create trigger set_documents_updated_at
before update on public.documents
for each row execute function app_private.set_updated_at();

-- RLS
alter table public.documents enable row level security;

drop policy if exists "documents_select_own" on public.documents;
create policy "documents_select_own" on public.documents for select to authenticated using (auth.uid() = owner_id);

drop policy if exists "documents_insert_own" on public.documents;
create policy "documents_insert_own" on public.documents for insert to authenticated with check (auth.uid() = owner_id);

drop policy if exists "documents_update_own" on public.documents;
create policy "documents_update_own" on public.documents for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "documents_delete_own" on public.documents;
create policy "documents_delete_own" on public.documents for delete to authenticated using (auth.uid() = owner_id);