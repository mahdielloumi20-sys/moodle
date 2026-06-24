-- Correctif RLS pour public.profiles.
-- A lancer une fois dans Supabase SQL Editor.
--
-- Cause du bug:
-- une policy SELECT sur public.profiles ne doit pas relire public.profiles
-- dans son USING, sinon PostgreSQL detecte une recursion infinie et le login
-- ne peut plus lire le role du compte connecte.

drop policy if exists "admins_read_all_profiles" on public.profiles;
drop policy if exists "profiles_select_admin" on public.profiles;
drop function if exists public.current_user_is_admin();

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

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

notify pgrst, 'reload schema';
