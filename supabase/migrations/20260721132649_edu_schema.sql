/*
# EDU Platform — Core Schema

## Overview
Creates the foundational tables for the EDU AI education platform: user
profiles, AI tools catalog, favorites, usage logs, and educational resources.
All user-scoped tables use owner-based Row Level Security.

## New Tables

### profiles
- `id` (uuid, PK, references auth.users) — one row per user
- `full_name` (text)
- `avatar_url` (text)
- `plan` (text: 'free' | 'pro', default 'free')
- `created_at` (timestamptz)

### ai_tools
- `id` (uuid, PK)
- `name` (text, not null)
- `slug` (text, unique)
- `description` (text)
- `icon` (text) — lucide icon name
- `category` (text)
- `is_pro` (boolean, default false)
- `usage_limit_free` (int, default 5)
- `rating` (numeric, default 0)
- `reviews_count` (int, default 0)
- `created_at` (timestamptz)

### favorites
- `id` (uuid, PK)
- `user_id` (uuid, references profiles, default auth.uid())
- `tool_id` (uuid, references ai_tools)
- `created_at` (timestamptz)
- unique (user_id, tool_id)

### usage_logs
- `id` (uuid, PK)
- `user_id` (uuid, references profiles, default auth.uid())
- `tool_id` (uuid, references ai_tools)
- `created_at` (timestamptz)

### resources
- `id` (uuid, PK)
- `name` (text, not null)
- `description` (text)
- `type` (text) — course | ebook | document | video | tutorial | exercise
- `category` (text)
- `image_url` (text)
- `is_premium` (boolean, default false)
- `rating` (numeric, default 0)
- `created_at` (timestamptz)

## Security
- RLS enabled on all tables.
- profiles: owner read/update; insert via trigger only.
- ai_tools, resources: public read (anon + authenticated), no writes from client.
- favorites, usage_logs: owner-scoped CRUD (insert default auth.uid()).
- Trigger `handle_new_user` creates a profile row on auth signup.
*/

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ai_tools
CREATE TABLE IF NOT EXISTS ai_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  category text,
  is_pro boolean NOT NULL DEFAULT false,
  usage_limit_free int NOT NULL DEFAULT 5,
  rating numeric NOT NULL DEFAULT 0,
  reviews_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ai_tools_read" ON ai_tools;
CREATE POLICY "ai_tools_read" ON ai_tools FOR SELECT
  TO anon, authenticated USING (true);

-- favorites
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tool_id)
);
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "favorites_select_own" ON favorites;
CREATE POLICY "favorites_select_own" ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "favorites_insert_own" ON favorites;
CREATE POLICY "favorites_insert_own" ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "favorites_delete_own" ON favorites;
CREATE POLICY "favorites_delete_own" ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- usage_logs
CREATE TABLE IF NOT EXISTS usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "usage_logs_select_own" ON usage_logs;
CREATE POLICY "usage_logs_select_own" ON usage_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "usage_logs_insert_own" ON usage_logs;
CREATE POLICY "usage_logs_insert_own" ON usage_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- resources
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL,
  category text,
  image_url text,
  is_premium boolean NOT NULL DEFAULT false,
  rating numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "resources_read" ON resources;
CREATE POLICY "resources_read" ON resources FOR SELECT
  TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tools_category ON ai_tools(category);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed AI tools
INSERT INTO ai_tools (name, slug, description, icon, category, is_pro, usage_limit_free, rating, reviews_count) VALUES
('AI Writing', 'ai-writing', 'Generate essays, articles, and creative content with AI.', 'PenLine', 'Writing', false, 10, 4.7, 320),
('AI Translator', 'ai-translator', 'Translate text between dozens of languages instantly.', 'Languages', 'Language', false, 15, 4.6, 210),
('AI Grammar Checker', 'ai-grammar-checker', 'Fix grammar, spelling, and style in your writing.', 'SpellCheck', 'Writing', false, 10, 4.8, 410),
('AI PDF Reader', 'ai-pdf-reader', 'Extract and understand content from PDF documents.', 'FileText', 'Documents', true, 3, 4.5, 150),
('AI Document Summarizer', 'ai-doc-summarizer', 'Summarize long documents into key points.', 'ScrollText', 'Documents', true, 3, 4.6, 180),
('AI Image Generator', 'ai-image-generator', 'Create stunning images from text prompts.', 'Image', 'Creative', true, 2, 4.4, 260),
('AI Logo Generator', 'ai-logo-generator', 'Design professional logos in seconds.', 'Palette', 'Creative', true, 2, 4.3, 120),
('AI Presentation Generator', 'ai-presentation', 'Build slide decks from a topic outline.', 'Presentation', 'Creative', true, 2, 4.5, 90),
('AI Resume Builder', 'ai-resume-builder', 'Craft a polished resume with AI guidance.', 'FileUser', 'Career', false, 5, 4.7, 300),
('AI Programming Assistant', 'ai-programming', 'Get help writing and debugging code.', 'Code2', 'Coding', false, 10, 4.9, 820),
('AI Coding Helper', 'ai-coding-helper', 'Explain snippets and suggest improvements.', 'Braces', 'Coding', false, 10, 4.8, 540),
('AI Chat Assistant', 'ai-chat', 'Conversational AI for any question.', 'MessageSquare', 'Assistant', false, 20, 4.8, 1200),
('AI Research Assistant', 'ai-research', 'Find and organize research sources.', 'Search', 'Research', true, 3, 4.5, 140),
('AI Math Solver', 'ai-math-solver', 'Solve equations and explain steps.', 'Calculator', 'Study', false, 10, 4.7, 610),
('AI Quiz Generator', 'ai-quiz-generator', 'Create quizzes from any topic.', 'ListChecks', 'Study', false, 8, 4.6, 230),
('AI Flashcard Generator', 'ai-flashcards', 'Turn notes into study flashcards.', 'Layers', 'Study', false, 8, 4.5, 190)
ON CONFLICT (slug) DO NOTHING;

-- Seed resources
INSERT INTO resources (name, description, type, category, image_url, is_premium, rating) VALUES
('Introduction to Python', 'Learn the fundamentals of Python programming.', 'course', 'Programming', 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg', false, 4.8),
('Data Science Essentials', 'Master the basics of data analysis and visualization.', 'course', 'Data Science', 'https://images.pexels.com/photos/5905702/pexels-photo-5905702.jpeg', true, 4.7),
('Calculus Made Easy', 'A clear introduction to differential and integral calculus.', 'ebook', 'Mathematics', 'https://images.pexels.com/photos/6386075/pexels-photo-6386075.jpeg', false, 4.6),
('Web Development Bootcamp', 'Build modern websites from scratch.', 'video', 'Programming', 'https://images.pexels.com/photos/270404/pexels-photo-270404.jpeg', true, 4.9),
('Essay Writing Masterclass', 'Improve your academic writing skills.', 'tutorial', 'Writing', 'https://images.pexels.com/photos/261909/pexels-photo-261909.jpeg', false, 4.5),
('Physics Practice Set', '100 problems with step-by-step solutions.', 'exercise', 'Science', 'https://images.pexels.com/photos/60022/pexels-photo-60022.jpeg', false, 4.4),
('Machine Learning Notes', 'Comprehensive ML theory document.', 'document', 'Data Science', 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg', true, 4.7),
('English Grammar Handbook', 'Complete reference for English grammar rules.', 'ebook', 'Language', 'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg', false, 4.6)
ON CONFLICT DO NOTHING;
