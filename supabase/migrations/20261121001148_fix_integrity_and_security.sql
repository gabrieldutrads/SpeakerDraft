-- ============================================================================
-- CORREÇÕES DE INTEGRIDADE E SEGURANÇA (Tarefa 02)
-- ============================================================================

-- 1. Correção do trigger anti-ciclo em folders para validar o dono do parent_id
create or replace function app_private.prevent_folder_cycle()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current_parent uuid := new.parent_id;
  max_depth      constant int := 100;
  depth          int := 0;
  parent_owner   uuid;
begin
  if tg_op = 'UPDATE' and new.parent_id is not distinct from old.parent_id then
    return new;
  end if;

  if new.parent_id = new.id then
    raise exception 'folder_cycle: uma pasta não pode ser pai de si mesma';
  end if;

  if new.parent_id is not null then
    select owner_id into parent_owner from public.folders where id = new.parent_id;
    if parent_owner is distinct from new.owner_id then
      raise exception 'folder_cycle: parent_id pertence a outro usuário';
    end if;
  end if;

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

-- 2. Adicionar chaves únicas compostas para permitir FKs de integridade
alter table public.folders add constraint folders_id_owner_key unique (id, owner_id);
alter table public.documents add constraint documents_id_owner_key unique (id, owner_id);

-- 3. Garantir que a pasta de um documento pertence ao mesmo dono
alter table public.documents
  add constraint documents_folder_owner_fk
  foreign key (folder_id, owner_id)
  references public.folders (id, owner_id)
  on delete set null;

-- 4. Garantir que o documento de um evento pertence ao mesmo dono
alter table public.events
  add constraint events_document_owner_fk
  foreign key (document_id, owner_id)
  references public.documents (id, owner_id)
  on delete set null;

-- 5. Correção no trigger de criação de perfil (aceitar 'name' ou 'full_name')
create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role, denomination)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    ),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(new.raw_user_meta_data ->> 'role', ''),
    nullif(new.raw_user_meta_data ->> 'denomination', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 6. Garantir que o bucket de PDFs continue privado caso a migration seja reaplicada
insert into storage.buckets (id, name, public)
values ('pdfs', 'pdfs', false)
on conflict (id) do update set public = false;