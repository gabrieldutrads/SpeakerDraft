-- ============================================================================
-- 0002_profiles.sql
-- oPregador (projeto: speaker-draft)
-- Tabela profiles vinculada a auth.users.
-- Cria perfil automaticamente no signup via trigger.
-- RLS: usuário só vê e altera o próprio perfil.
-- ============================================================================

create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  email            text not null,
  full_name        text not null default '',
  avatar_url       text,
  role             text,
  denomination     text,
  theme_preference text not null default 'system'
                   check (theme_preference in ('system', 'light', 'dark')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.profiles is
  'Perfil do usuário, 1:1 com auth.users. Criado via trigger handle_new_user.';

comment on column public.profiles.role is
  'Cargo/função ministerial (texto livre: pastor, pregador, professor, etc).';

-- Índice para buscas administrativas por e-mail
create index if not exists profiles_email_idx on public.profiles (lower(email));

-- Trigger de updated_at (reaproveita a função do 0001)
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function app_private.set_updated_at();

-- ----------------------------------------------------------------------------
-- Trigger: handle_new_user()
-- Cria automaticamente um perfil quando um novo usuário é criado em auth.users.
-- Lê full_name, avatar_url, role e denomination de raw_user_meta_data (opcionais).
-- SECURITY DEFINER para poder escrever em public.profiles no contexto do signup.
-- search_path travado para evitar sequestro.
-- ----------------------------------------------------------------------------
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
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(new.raw_user_meta_data ->> 'role', ''),
    nullif(new.raw_user_meta_data ->> 'denomination', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

comment on function app_private.handle_new_user() is
  'Cria perfil em public.profiles quando um usuário é inserido em auth.users.';

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function app_private.handle_new_user();

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Usuário autenticado vê apenas o próprio perfil
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

-- Usuário autenticado atualiza apenas o próprio perfil
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Insert é feito exclusivamente pelo trigger handle_new_user (security definer).
-- Portanto, nenhuma policy de insert para usuários comuns.
-- Delete: desabilitado (perfil só some junto com auth.users via cascade).