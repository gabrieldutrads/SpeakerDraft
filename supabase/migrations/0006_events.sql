-- ============================================================================
-- 0006_events.sql
-- Agenda ministerial (cultos, estudos, compromissos).
-- ============================================================================

create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null,
  title       text not null check (length(trim(title)) > 0),
  date        date not null,
  time        time not null,
  location    text,
  event_type  text not null default 'culto' check (event_type in ('culto', 'ebd', 'estudo', 'conferencia', 'reuniao', 'outro')),
  status      text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.events is 'Compromissos da agenda ministerial, opcionalmente vinculados a um documento.';

-- Índices
create index if not exists events_owner_date_idx on public.events (owner_id, date);
create index if not exists events_owner_document_idx on public.events (owner_id, document_id);

-- Trigger updated_at
drop trigger if exists set_events_updated_at on public.events;
create trigger set_events_updated_at
before update on public.events
for each row execute function app_private.set_updated_at();

-- RLS
alter table public.events enable row level security;

drop policy if exists "events_select_own" on public.events;
create policy "events_select_own" on public.events for select to authenticated using (auth.uid() = owner_id);

drop policy if exists "events_insert_own" on public.events;
create policy "events_insert_own" on public.events for insert to authenticated with check (auth.uid() = owner_id);

drop policy if exists "events_update_own" on public.events;
create policy "events_update_own" on public.events for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "events_delete_own" on public.events;
create policy "events_delete_own" on public.events for delete to authenticated using (auth.uid() = owner_id);