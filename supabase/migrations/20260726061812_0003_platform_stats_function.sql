/*
# Add user stats function

Creates a security-definer function `get_platform_stats()` that returns
counts of users (from auth.users), tools, resources, and categories —
accessible to the anon key for the admin dashboard.
*/

create or replace function get_platform_stats()
returns json
language plpgsql
security definer
as $$
declare
  v_users int;
  v_tools int;
  v_resources int;
  v_categories int;
begin
  select count(*) into v_users from auth.users;
  select count(*) into v_tools from ai_tools;
  select count(*) into v_resources from resources;
  select count(*) into v_categories from categories;

  return json_build_object(
    'users', v_users,
    'tools', v_tools,
    'resources', v_resources,
    'categories', v_categories
  );
end;
$$;
