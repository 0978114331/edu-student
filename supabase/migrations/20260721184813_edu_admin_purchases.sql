/*
# EDU Platform — Admin Roles, Tool Pricing, and Purchases

## Overview
This migration adds:
1. A `role` column to `profiles` to distinguish admin users from regular users.
2. A `price` column to `ai_tools` so individual tools can be sold.
3. A `purchases` table to record tool and plan purchases with payment details.
4. RLS policies allowing admins to manage `ai_tools` and `resources` (insert/update/delete).
5. RLS policies allowing admins to read all profiles and update user plans.

## Modified Tables

### profiles
- Added `role` column (text: 'user' | 'admin', default 'user').

### ai_tools
- Added `price` column (numeric, default 0) — price in USD for individual tool purchase.

## New Tables

### purchases
- `id` (uuid, PK)
- `user_id` (uuid, references profiles, default auth.uid())
- `item_type` (text: 'tool' | 'plan')
- `item_id` (uuid, nullable — references ai_tools when item_type='tool')
- `amount` (numeric)
- `currency` (text, default 'USD')
- `payment_method` (text — e.g. 'Visa', 'ABA Pay', 'KHQR', etc.)
- `status` (text: 'pending' | 'completed' | 'failed', default 'completed')
- `card_last4` (text, nullable — last 4 digits of card for reference)
- `created_at` (timestamptz)

## Security
- Admins are identified by `profiles.role = 'admin'`.
- Admins can INSERT/UPDATE/DELETE on `ai_tools` and `resources`.
- Admins can SELECT all profiles and UPDATE profile plan/role.
- Regular users can only INSERT/SELECT their own purchases.
- A SECURITY DEFINER function `is_admin()` checks the caller's role.

## Important Notes
1. The first admin must be set manually via SQL: `UPDATE profiles SET role='admin' WHERE id = '<uuid>';`
2. Purchase records are immutable once created (no update/delete policy for users).
3. Tool prices default to 0 (free); admins can set prices via the admin dashboard.
*/

-- Add role column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin'));

-- Add price column to ai_tools
ALTER TABLE ai_tools ADD COLUMN IF NOT EXISTS price numeric NOT NULL DEFAULT 0;

-- is_admin helper function (SECURITY DEFINER to bypass RLS on profiles read)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  item_type text NOT NULL CHECK (item_type IN ('tool','plan')),
  item_id uuid REFERENCES ai_tools(id) ON DELETE SET NULL,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  payment_method text,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending','completed','failed')),
  card_last4 text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "purchases_select_own" ON purchases;
CREATE POLICY "purchases_select_own" ON purchases FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "purchases_insert_own" ON purchases;
CREATE POLICY "purchases_insert_own" ON purchases FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Admin policies on ai_tools
DROP POLICY IF EXISTS "ai_tools_admin_insert" ON ai_tools;
CREATE POLICY "ai_tools_admin_insert" ON ai_tools FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "ai_tools_admin_update" ON ai_tools;
CREATE POLICY "ai_tools_admin_update" ON ai_tools FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "ai_tools_admin_delete" ON ai_tools;
CREATE POLICY "ai_tools_admin_delete" ON ai_tools FOR DELETE
  TO authenticated USING (public.is_admin());

-- Admin policies on resources
DROP POLICY IF EXISTS "resources_admin_insert" ON resources;
CREATE POLICY "resources_admin_insert" ON resources FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "resources_admin_update" ON resources;
CREATE POLICY "resources_admin_update" ON resources FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "resources_admin_delete" ON resources;
CREATE POLICY "resources_admin_delete" ON resources FOR DELETE
  TO authenticated USING (public.is_admin());

-- Admin can read all profiles
DROP POLICY IF EXISTS "profiles_admin_select_all" ON profiles;
CREATE POLICY "profiles_admin_select_all" ON profiles FOR SELECT
  TO authenticated USING (public.is_admin() OR auth.uid() = id);

-- Admin can update profiles (plan, role, name)
DROP POLICY IF EXISTS "profiles_admin_update_all" ON profiles;
CREATE POLICY "profiles_admin_update_all" ON profiles FOR UPDATE
  TO authenticated USING (public.is_admin() OR auth.uid() = id)
  WITH CHECK (public.is_admin() OR auth.uid() = id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_item ON purchases(item_type, item_id);

-- Update existing profiles select policy to also allow admin
-- (already handled by profiles_admin_select_all above which replaces the old one)
