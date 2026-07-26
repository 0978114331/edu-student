/*
# Add user profiles table with roles

1. Purpose
- Stores per-user metadata: role (super_admin/admin/editor/student/guest), avatar URL, full name.
- The first user to sign up is automatically promoted to super_admin so they can access the admin dashboard.
- Subsequent users default to 'student' role and cannot access admin routes.

2. New Tables
- `profiles` — mirrors auth.users with role, avatar_url, full_name, created_at.

3. Security (RLS)
- Users can read their own profile.
- Admins (super_admin / admin roles) can read all profiles and update roles.
- A trigger auto-creates a profile row on signup, assigning super_admin to the first user.

4. Notes
- `is_first_user()` helper checks if any auth.users exist before the current one.
- The trigger runs on auth user insert, creating the matching profiles row.
*/

create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role text not null default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "read_own_profile" on profiles;
create policy "read_own_profile" on profiles for select to authenticated using (auth.uid() = id);

drop policy if exists "admin_read_all_profiles" on profiles;
create policy "admin_read_all_profiles" on profiles for select to authenticated using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('super_admin', 'admin'))
);

drop policy if exists "admin_update_profiles" on profiles;
create policy "admin_update_profiles" on profiles for update to authenticated using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('super_admin', 'admin'))
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('super_admin', 'admin'))
);

drop policy if exists "update_own_profile" on profiles;
create policy "update_own_profile" on profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Helper: check if current user is admin
create or replace function is_admin()
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from profiles p where p.id = auth.uid() and p.role in ('super_admin', 'admin')
  );
$$;

-- Helper: check if any auth.users exist (for first-user detection)
create or replace function is_first_user()
returns boolean
language sql
security definer
as $$
  select count(*) = 0 from auth.users;
$$;

-- Trigger: auto-create profile on signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  v_role text;
begin
  if is_first_user() then
    v_role := 'super_admin';
  else
    v_role := 'student';
  end if;
  insert into profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    v_role
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- updated_at trigger
drop trigger if exists trg_profiles_updated on profiles;
create trigger trg_profiles_updated before update on profiles
for each row execute function set_updated_at();
