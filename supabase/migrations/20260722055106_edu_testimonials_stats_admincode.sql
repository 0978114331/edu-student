/*
# EDU Platform — Testimonials, Site Stats, Admin Code Config

## Overview
This migration adds:
1. A `testimonials` table to store real student testimonials.
2. An `admin_config` table to store the admin access code (backend-secured).
3. A `get_site_stats()` function returning live counts (tools, resources, users, purchases).
4. A `verify_admin_code()` function to check the admin access code server-side.

## New Tables

### testimonials
- `id` (uuid, PK)
- `name` (text, not null)
- `role` (text) — e.g. "Computer Science Student"
- `avatar_url` (text)
- `text` (text, not null) — the testimonial content
- `rating` (int, default 5, 1-5)
- `created_at` (timestamptz)

### admin_config
- `id` (int, PK, always 1 — singleton row)
- `admin_code` (text, not null) — the secret code admins must enter
- `updated_at` (timestamptz)

## Security
- testimonials: public read (anon + authenticated), admin-only write.
- admin_config: no direct read/write via RLS (locked down). Access only through SECURITY DEFINER functions.
- `verify_admin_code(code)` checks the code without exposing it.
- `get_site_stats()` returns live counts as JSON.

## Important Notes
1. The default admin code is "EDU-ADMIN-2026". Change it via admin dashboard.
2. testimonials are seeded with 3 entries.
3. admin_config has RLS enabled with NO policies — it's inaccessible via the anon key.
*/

-- testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  avatar_url text,
  text text NOT NULL,
  rating int NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "testimonials_read" ON testimonials;
CREATE POLICY "testimonials_read" ON testimonials FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "testimonials_admin_insert" ON testimonials;
CREATE POLICY "testimonials_admin_insert" ON testimonials FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "testimonials_admin_update" ON testimonials;
CREATE POLICY "testimonials_admin_update" ON testimonials FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "testimonials_admin_delete" ON testimonials;
CREATE POLICY "testimonials_admin_delete" ON testimonials FOR DELETE
  TO authenticated USING (public.is_admin());

-- admin_config (singleton)
CREATE TABLE IF NOT EXISTS admin_config (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  admin_code text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;
-- No policies: completely inaccessible via anon key

-- Insert default admin code
INSERT INTO admin_config (id, admin_code) VALUES (1, 'EDU-ADMIN-2026')
ON CONFLICT (id) DO NOTHING;

-- verify_admin_code function (SECURITY DEFINER — checks code without exposing it)
CREATE OR REPLACE FUNCTION public.verify_admin_code(input_code text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_config
    WHERE id = 1 AND admin_code = input_code
  );
$$;

-- get_site_stats function (returns live counts)
CREATE OR REPLACE FUNCTION public.get_site_stats()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'tools', (SELECT count(*) FROM ai_tools),
    'resources', (SELECT count(*) FROM resources),
    'students', (SELECT count(*) FROM profiles),
    'purchases', (SELECT count(*) FROM purchases WHERE status = 'completed'),
    'revenue', (SELECT coalesce(sum(amount), 0) FROM purchases WHERE status = 'completed')
  );
$$;

-- update_admin_code function (admin-only)
CREATE OR REPLACE FUNCTION public.update_admin_code(new_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  UPDATE admin_config SET admin_code = new_code, updated_at = now() WHERE id = 1;
  RETURN true;
END;
$$;

-- Seed testimonials
INSERT INTO testimonials (name, role, avatar_url, text, rating) VALUES
('Sopheap Ly', 'Computer Science Student', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200', 'EDU transformed how I study. The AI Programming Assistant helps me debug code faster than ever before.', 5),
('Dara Kim', 'High School Student', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200', 'The Math Solver explains every step clearly. My grades have improved significantly this semester.', 5),
('Chanthou Mey', 'University Student', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200', 'I love how all the AI tools and resources are in one place. The Pro plan is absolutely worth it.', 5)
ON CONFLICT DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_created ON testimonials(created_at);
