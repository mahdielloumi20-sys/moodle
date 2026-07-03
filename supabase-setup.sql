-- Run this in the Supabase SQL editor.
-- It creates a profiles table linked to auth.users and stores the role used by the LMS.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  first_name text not null default '',
  last_name text not null default '',
  role text not null default 'participant'
    check (role in ('admin', 'trainer', 'participant')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "admins_read_all_profiles" on public.profiles;
drop policy if exists "profiles_select_admin" on public.profiles;
drop function if exists public.current_user_is_admin();

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'participant')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    role = excluded.role,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;

create or replace function public.admin_list_profiles()
returns table (
  id uuid,
  email text,
  first_name text,
  last_name text,
  role text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  caller_role text;
begin
  select p.role
  into caller_role
  from public.profiles p
  where p.id = auth.uid();

  if caller_role <> 'admin' then
    raise exception 'Admin role required';
  end if;

  return query
  select p.id, p.email, p.first_name, p.last_name, p.role
  from public.profiles p
  order by p.created_at desc;
end;
$$;

revoke all on function public.admin_list_profiles() from public;
grant execute on function public.admin_list_profiles() to authenticated;

comment on table public.profiles is 'Profile LMS liÃ© Ã  auth.users. Le rÃ´le contrÃ´le la redirection aprÃ¨s login.';
comment on column public.profiles.role is 'Valeurs autorisÃ©es: admin, trainer, participant.';

-- Séances formateur : liste par formation et rattachement des cours ajoutés.
alter table if exists public.courses
add column if not exists seances jsonb not null default '[{"id":"s1","label":"S\u00e9ance 1"}]'::jsonb;

alter table if exists public.course_contents
add column if not exists seance_id text not null default 's1';

