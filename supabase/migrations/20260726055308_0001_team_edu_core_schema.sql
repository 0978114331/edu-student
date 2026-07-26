/*
# TEAM EDU Core Schema

1. Purpose
- Creates the data backbone for TEAM EDU, an AI-powered education platform.
- Administrators manage AI tools, resources, categories, providers, and platform settings dynamically from the dashboard — no code changes needed to add tools.
- Public visitors browse tools/resources; signed-in users favorite tools and track recently used.

2. New Tables
- `categories` — unlimited categories for tools and resources (Programming, AI, Web Dev, etc.).
- `ai_tools` — the AI tool marketplace. Each row is fully configurable from the admin dashboard.
- `resources` — educational resources (courses, books, PDFs, videos, etc.).
- `favorites` — per-user favorites on ai_tools.
- `recently_used` — per-user recently opened tools with usage count and last access time.
- `reviews` — per-user ratings + comments on ai_tools.
- `providers` — AI provider configs (OpenAI, Claude, Gemini, etc.).
- `activity_logs` — admin/platform activity audit trail.
- `settings` — single-row platform settings.

3. Security (RLS)
- Public read access on categories, ai_tools, resources, providers, settings — via `anon, authenticated`.
- Authenticated users can insert/update/delete their own favorites, recently_used, and reviews.
- Admin write access on all tables via `anon, authenticated` for now (single-admin demo).

4. Notes
- `ai_tools.stats_*` columns are incremented via RPC `increment_tool_stat`.
- All tables use `gen_random_uuid()` primary keys and `timestamptz` timestamps.
*/

create extension if not exists "pgcrypto";

-- ================= categories =================
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  color text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table categories enable row level security;

drop policy if exists "anon_read_categories" on categories;
create policy "anon_read_categories" on categories for select to anon, authenticated using (true);
drop policy if exists "anon_write_categories" on categories;
create policy "anon_write_categories" on categories for insert to anon, authenticated with check (true);
drop policy if exists "anon_update_categories" on categories;
create policy "anon_update_categories" on categories for update to anon, authenticated using (true) with check (true);
drop policy if exists "anon_delete_categories" on categories;
create policy "anon_delete_categories" on categories for delete to anon, authenticated using (true);

-- ================= ai_tools =================
create table if not exists ai_tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text,
  full_description text,
  category_id uuid references categories(id) on delete set null,
  tags text[] not null default '{}',
  developer_name text,
  version text,
  icon_url text,
  thumbnail_url text,
  banner_url text,
  website_url text,
  documentation_url text,
  github_url text,
  demo_url text,
  link_type text not null default 'external',
  pricing_type text not null default 'free',
  status text not null default 'active',
  is_featured boolean not null default false,
  is_popular boolean not null default false,
  is_premium boolean not null default false,
  is_published boolean not null default true,
  is_archived boolean not null default false,
  language text not null default 'en',
  sort_order int not null default 0,
  stats_views int not null default 0,
  stats_clicks int not null default 0,
  stats_favorites int not null default 0,
  stats_shares int not null default 0,
  stats_downloads int not null default 0,
  stats_rating_sum int not null default 0,
  stats_rating_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table ai_tools enable row level security;

drop policy if exists "anon_read_ai_tools" on ai_tools;
create policy "anon_read_ai_tools" on ai_tools for select to anon, authenticated using (true);
drop policy if exists "anon_insert_ai_tools" on ai_tools;
create policy "anon_insert_ai_tools" on ai_tools for insert to anon, authenticated with check (true);
drop policy if exists "anon_update_ai_tools" on ai_tools;
create policy "anon_update_ai_tools" on ai_tools for update to anon, authenticated using (true) with check (true);
drop policy if exists "anon_delete_ai_tools" on ai_tools;
create policy "anon_delete_ai_tools" on ai_tools for delete to anon, authenticated using (true);

-- ================= resources =================
create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  category_id uuid references categories(id) on delete set null,
  resource_type text not null default 'article',
  thumbnail_url text,
  url text,
  author text,
  tags text[] not null default '{}',
  is_premium boolean not null default false,
  status text not null default 'published',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table resources enable row level security;

drop policy if exists "anon_read_resources" on resources;
create policy "anon_read_resources" on resources for select to anon, authenticated using (true);
drop policy if exists "anon_insert_resources" on resources;
create policy "anon_insert_resources" on resources for insert to anon, authenticated with check (true);
drop policy if exists "anon_update_resources" on resources;
create policy "anon_update_resources" on resources for update to anon, authenticated using (true) with check (true);
drop policy if exists "anon_delete_resources" on resources;
create policy "anon_delete_resources" on resources for delete to anon, authenticated using (true);

-- ================= favorites =================
create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  tool_id uuid not null references ai_tools(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, tool_id)
);

alter table favorites enable row level security;

drop policy if exists "select_own_favorites" on favorites;
create policy "select_own_favorites" on favorites for select to authenticated using (auth.uid() = user_id);
drop policy if exists "insert_own_favorites" on favorites;
create policy "insert_own_favorites" on favorites for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "delete_own_favorites" on favorites;
create policy "delete_own_favorites" on favorites for delete to authenticated using (auth.uid() = user_id);

-- ================= recently_used =================
create table if not exists recently_used (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  tool_id uuid not null references ai_tools(id) on delete cascade,
  usage_count int not null default 1,
  last_accessed_at timestamptz not null default now(),
  unique (user_id, tool_id)
);

alter table recently_used enable row level security;

drop policy if exists "select_own_recently_used" on recently_used;
create policy "select_own_recently_used" on recently_used for select to authenticated using (auth.uid() = user_id);
drop policy if exists "insert_own_recently_used" on recently_used;
create policy "insert_own_recently_used" on recently_used for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "update_own_recently_used" on recently_used;
create policy "update_own_recently_used" on recently_used for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "delete_own_recently_used" on recently_used;
create policy "delete_own_recently_used" on recently_used for delete to authenticated using (auth.uid() = user_id);

-- ================= reviews =================
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references ai_tools(id) on delete cascade,
  user_id uuid not null default auth.uid(),
  rating int not null default 5 check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tool_id, user_id)
);

alter table reviews enable row level security;

drop policy if exists "read_reviews" on reviews;
create policy "read_reviews" on reviews for select to anon, authenticated using (true);
drop policy if exists "insert_own_reviews" on reviews;
create policy "insert_own_reviews" on reviews for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "update_own_reviews" on reviews;
create policy "update_own_reviews" on reviews for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "delete_own_reviews" on reviews;
create policy "delete_own_reviews" on reviews for delete to authenticated using (auth.uid() = user_id);

-- ================= providers =================
create table if not exists providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  api_key text,
  base_url text,
  model text,
  temperature numeric not null default 0.7,
  max_tokens int not null default 2048,
  status text not null default 'active',
  icon_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table providers enable row level security;

drop policy if exists "anon_read_providers" on providers;
create policy "anon_read_providers" on providers for select to anon, authenticated using (true);
drop policy if exists "anon_write_providers" on providers;
create policy "anon_write_providers" on providers for insert to anon, authenticated with check (true);
drop policy if exists "anon_update_providers" on providers;
create policy "anon_update_providers" on providers for update to anon, authenticated using (true) with check (true);
drop policy if exists "anon_delete_providers" on providers;
create policy "anon_delete_providers" on providers for delete to anon, authenticated using (true);

-- ================= activity_logs =================
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor text,
  action text not null,
  entity_type text,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

alter table activity_logs enable row level security;

drop policy if exists "anon_read_activity_logs" on activity_logs;
create policy "anon_read_activity_logs" on activity_logs for select to anon, authenticated using (true);
drop policy if exists "anon_insert_activity_logs" on activity_logs;
create policy "anon_insert_activity_logs" on activity_logs for insert to anon, authenticated with check (true);

-- ================= settings =================
create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default 'TEAM EDU',
  tagline text,
  logo_url text,
  favicon_url text,
  primary_color text not null default '#2563eb',
  default_theme text not null default 'dark',
  homepage_banner_url text,
  seo_title text,
  seo_description text,
  google_analytics_id text,
  smtp_host text,
  telegram_bot_token text,
  maintenance_mode boolean not null default false,
  default_language text not null default 'en',
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table settings enable row level security;

drop policy if exists "anon_read_settings" on settings;
create policy "anon_read_settings" on settings for select to anon, authenticated using (true);
drop policy if exists "anon_update_settings" on settings;
create policy "anon_update_settings" on settings for update to anon, authenticated using (true) with check (true);
drop policy if exists "anon_insert_settings" on settings;
create policy "anon_insert_settings" on settings for insert to anon, authenticated with check (true);

-- ================= Indexes =================
create index if not exists idx_ai_tools_category on ai_tools(category_id);
create index if not exists idx_ai_tools_published on ai_tools(is_published);
create index if not exists idx_ai_tools_featured on ai_tools(is_featured);
create index if not exists idx_ai_tools_slug on ai_tools(slug);
create index if not exists idx_resources_category on resources(category_id);
create index if not exists idx_resources_slug on resources(slug);
create index if not exists idx_categories_slug on categories(slug);
create index if not exists idx_favorites_user on favorites(user_id);
create index if not exists idx_recently_used_user on recently_used(user_id);
create index if not exists idx_reviews_tool on reviews(tool_id);

-- ================= RPC: increment_tool_stat =================
create or replace function increment_tool_stat(p_tool_id uuid, p_stat text)
returns void
language plpgsql
security definer
as $$
begin
  if p_stat = 'views' then
    update ai_tools set stats_views = stats_views + 1, updated_at = now() where id = p_tool_id;
  elsif p_stat = 'clicks' then
    update ai_tools set stats_clicks = stats_clicks + 1, updated_at = now() where id = p_tool_id;
  elsif p_stat = 'shares' then
    update ai_tools set stats_shares = stats_shares + 1, updated_at = now() where id = p_tool_id;
  elsif p_stat = 'downloads' then
    update ai_tools set stats_downloads = stats_downloads + 1, updated_at = now() where id = p_tool_id;
  elsif p_stat = 'favorites' then
    update ai_tools set stats_favorites = stats_favorites + 1, updated_at = now() where id = p_tool_id;
  elsif p_stat = 'favorites_dec' then
    update ai_tools set stats_favorites = greatest(0, stats_favorites - 1), updated_at = now() where id = p_tool_id;
  end if;
end;
$$;

-- ================= updated_at triggers =================
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_categories_updated on categories;
create trigger trg_categories_updated before update on categories
for each row execute function set_updated_at();

drop trigger if exists trg_ai_tools_updated on ai_tools;
create trigger trg_ai_tools_updated before update on ai_tools
for each row execute function set_updated_at();

drop trigger if exists trg_resources_updated on resources;
create trigger trg_resources_updated before update on resources
for each row execute function set_updated_at();

drop trigger if exists trg_providers_updated on providers;
create trigger trg_providers_updated before update on providers
for each row execute function set_updated_at();

drop trigger if exists trg_settings_updated on settings;
create trigger trg_settings_updated before update on settings
for each row execute function set_updated_at();

drop trigger if exists trg_reviews_updated on reviews;
create trigger trg_reviews_updated before update on reviews
for each row execute function set_updated_at();

-- ================= Default settings row =================
insert into settings (site_name, tagline, seo_title, seo_description)
values ('TEAM EDU', 'AI-Powered Education Platform', 'TEAM EDU — AI Tools for Education', 'Discover, compare, and use the best AI tools for learning, teaching, and research.')
on conflict do nothing;
