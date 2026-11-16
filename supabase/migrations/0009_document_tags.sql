-- ============================================================================
-- 0009_document_tags.sql
-- Relacionamento N:N entre documentos e tags.
-- ============================================================================

create table if not exists public.document_tags (
  document_id uuid not null references public.documents(id) on delete cascade,
  tag_id      uuid not null references public.tags(id) on delete cascade,
  owner_id    uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (document_id, tag_id)
);

comment on table public.document_tags is 'Relacionamento entre documentos e tags, com redundância de owner para facilitar RLS.';

create index if not exists document_tags_owner_idx on public.document_tags (owner_id);

-- RLS
alter table public.document_tags enable row level security;

drop policy if exists "document_tags_select_own" on public.document_tags;
create policy "document_tags_select_own" on public.document_tags for select to authenticated using (auth.uid() = owner_id);

drop policy if exists "document_tags_insert_own" on public.document_tags;
create policy "document_tags_insert_own" on public.document_tags for insert to authenticated with check (auth.uid() = owner_id);

drop policy if exists "document_tags_delete_own" on public.document_tags;
create policy "document_tags_delete_own" on public.document_tags for delete to authenticated using (auth.uid() = owner_id);

-- (Não há update policy porque a tabela só tem PKs e created_at; para mudar a tag, deleta e insere novamente).