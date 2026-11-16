-- ============================================================================
-- 0007_library_items.sql
-- Biblioteca pessoal (ilustrações, citações, notas exegéticas, etc).
-- ============================================================================

create table if not exists public.library_items (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references auth.users(id) on delete cascade,
  item_type        text not null default 'illustration' check (item_type in ('illustration', 'quote', 'exegetical_note', 'commentary', 'outline_template')),
  title            text not null check (length(trim(title)) > 0),
  author           text,
  content          text not null check (length(trim(content)) > 0),
  citation         text,
  tags             text[] not null default '{}',
  bible_references text[] not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.library_items is 'Itens da biblioteca pessoal, reutilizáveis em sermões.';

-- Índices
create index if not exists library_items_owner_idx on public.library_items (owner_id);
create index if not exists library_items_owner_type_idx on public.library_items (owner_id, item_type);
create index if not exists library_items_tags_idx on public.library_items using gin (tags);
create index if not exists library_items_bible_refs_idx on public.library_items using gin (bible_references);

-- Trigger updated_at
drop trigger if exists set_library_items_updated_at on public.library_items;
create trigger set_library_items_updated_at
before update on public.library_items
for each row execute function app_private.set_updated_at();

-- RLS
alter table public.library_items enable row level security;

drop policy if exists "library_items_select_own" on public.library_items;
create policy "library_items_select_own" on public.library_items for select to authenticated using (auth.uid() = owner_id);

drop policy if exists "library_items_insert_own" on public.library_items;
create policy "library_items_insert_own" on public.library_items for insert to authenticated with check (auth.uid() = owner_id);

drop policy if exists "library_items_update_own" on public.library_items;
create policy "library_items_update_own" on public.library_items for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "library_items_delete_own" on public.library_items;
create policy "library_items_delete_own" on public.library_items for delete to authenticated using (auth.uid() = owner_id);