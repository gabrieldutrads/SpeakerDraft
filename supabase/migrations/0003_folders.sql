-- ============================================================================
-- 0003_folders.sql
-- oPregador (projeto: speaker-draft)
-- Tabela folders com suporte a hierarquia (parent_id).
-- Proteção contra ciclos (anti-loop), unicidade por nível e RLS.
-- ============================================================================

create table if not exists public.folders (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users(id) on delete cascade,
  name       text not null check (length(trim(name)) > 0),
  parent_id  uuid references public.folders(id) on delete cascade,
  color      text,
  icon       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.folders is
  'Pastas hierárquicas do usuário. parent_id nulo = pasta raiz.';

-- Índices para performance
create index if not exists folders_owner_idx on public.folders (owner_id);
create index if not exists folders_owner_parent_idx on public.folders (owner_id, parent_id);

-- Unicidade: não permite duas pastas com o mesmo nome no mesmo nível para o mesmo dono.
-- COALESCE é usado porque NULLs não são considerados iguais em constraint UNIQUE padrão.
create unique index if not exists folders_owner_parent_name_uniq
  on public.folders (owner_id, coalesce(parent_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(name));

-- Trigger de updated_at
drop trigger if exists set_folders_updated_at on public.folders;
create trigger set_folders_updated_at
before update on public.folders
for each row execute function app_private.set_updated_at();

-- ----------------------------------------------------------------------------
-- Trigger: prevent_folder_cycle()
-- Impede que uma pasta seja pai de si mesma ou de um de seus ancestrais.
-- Sobe a árvore a partir do parent_id e verifica se encontra o id atual.
-- Usa SECURITY DEFINER para poder inspecionar a tabela sem depender de RLS.
-- ----------------------------------------------------------------------------
create or replace function app_private.prevent_folder_cycle()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current_parent uuid := new.parent_id;
  max_depth      constant int := 100; -- trava de segurança contra loops já existentes
  depth          int := 0;
begin
  -- Update que não alterou parent_id não precisa verificar
  if tg_op = 'UPDATE' and new.parent_id is not distinct from old.parent_id then
    return new;
  end if;

  -- Não pode ser pai de si mesmo
  if new.parent_id = new.id then
    raise exception 'folder_cycle: uma pasta não pode ser pai de si mesma';
  end if;

  -- Sobe a árvore verificando ciclos
  while current_parent is not null loop
    if current_parent = new.id then
      raise exception 'folder_cycle: hierarquia inválida (ciclo detectado)';
    end if;

    select parent_id into current_parent
    from public.folders
    where id = current_parent
      and owner_id = new.owner_id;

    depth := depth + 1;
    if depth > max_depth then
      raise exception 'folder_cycle: profundidade máxima excedida';
    end if;
  end loop;

  return new;
end;
$$;

comment on function app_private.prevent_folder_cycle() is
  'Impede ciclos na hierarquia de folders e valida que parent pertence ao mesmo owner.';

drop trigger if exists folders_prevent_cycle on public.folders;
create trigger folders_prevent_cycle
before insert or update on public.folders
for each row execute function app_private.prevent_folder_cycle();

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
alter table public.folders enable row level security;

drop policy if exists "folders_select_own" on public.folders;
create policy "folders_select_own"
on public.folders for select to authenticated
using (auth.uid() = owner_id);

drop policy if exists "folders_insert_own" on public.folders;
create policy "folders_insert_own"
on public.folders for insert to authenticated
with check (auth.uid() = owner_id);

drop policy if exists "folders_update_own" on public.folders;
create policy "folders_update_own"
on public.folders for update to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "folders_delete_own" on public.folders;
create policy "folders_delete_own"
on public.folders for delete to authenticated
using (auth.uid() = owner_id);