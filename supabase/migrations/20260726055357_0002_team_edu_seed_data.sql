/*
# TEAM EDU Seed Data

1. Purpose
- Populates the platform with initial categories, AI tools, resources, and providers so the marketplace is populated on first load.
- All data is editable/deletable from the admin dashboard — this just gives a non-empty starting point.

2. Seeded Tables
- `categories` — 14 categories covering programming, AI, design, business, etc.
- `ai_tools` — 12 popular AI tools (ChatGPT, Claude, Gemini, Bolt, etc.) with real URLs, descriptions, flags, and randomized stats.
- `resources` — 8 educational resources across types (course, video, book, docs, github).
- `providers` — 7 AI providers with default models and temperatures.

3. Notes
- Uses `on conflict (slug) do nothing` so re-running is safe.
- Stats are seeded with realistic-looking numbers for the analytics dashboard.
- Images use Pexels stock photos for thumbnails/banners.
*/

-- ================= Categories =================
insert into categories (name, slug, description, icon, color, sort_order) values
('Artificial Intelligence', 'artificial-intelligence', 'AI tools, assistants, and platforms', 'Sparkles', '#6366f1', 1),
('Web Development', 'web-development', 'Tools for building modern web apps', 'Code2', '#0ea5e9', 2),
('Programming', 'programming', 'Code editors, generators, and helpers', 'Terminal', '#22c55e', 3),
('Mobile Development', 'mobile-development', 'Cross-platform and native mobile tools', 'Smartphone', '#f97316', 4),
('Design', 'design', 'UI/UX and graphic design tools', 'Palette', '#ec4899', 5),
('Productivity', 'productivity', 'Tools to boost your workflow', 'Zap', '#eab308', 6),
('Writing', 'writing', 'AI writing and content tools', 'PenLine', '#14b8a6', 7),
('Research', 'research', 'Search, summarize, and analyze', 'Search', '#8b5cf6', 8),
('Video', 'video', 'AI video generation and editing', 'Video', '#ef4444', 9),
('Image', 'image', 'AI image generation and editing', 'Image', '#d946ef', 10),
('Business', 'business', 'Tools for business and marketing', 'Briefcase', '#0d9488', 11),
('Education', 'education', 'Learning platforms and resources', 'GraduationCap', '#3b82f6', 12),
('Cloud Computing', 'cloud-computing', 'Cloud infrastructure and services', 'Cloud', '#64748b', 13),
('Cyber Security', 'cyber-security', 'Security tools and platforms', 'ShieldCheck', '#dc2626', 14)
on conflict (slug) do nothing;

-- ================= AI Tools =================
-- Helper: insert tool with category lookup by slug
do $$
declare
  v_ai uuid; v_web uuid; v_prog uuid; v_prod uuid; v_write uuid; v_res uuid;
  v_video uuid; v_image uuid; v_business uuid; v_edu uuid; v_design uuid;
begin
  select id into v_ai from categories where slug='artificial-intelligence';
  select id into v_web from categories where slug='web-development';
  select id into v_prog from categories where slug='programming';
  select id into v_prod from categories where slug='productivity';
  select id into v_write from categories where slug='writing';
  select id into v_res from categories where slug='research';
  select id into v_video from categories where slug='video';
  select id into v_image from categories where slug='image';
  select id into v_business from categories where slug='business';
  select id into v_edu from categories where slug='education';
  select id into v_design from categories where slug='design';

  insert into ai_tools (name, slug, short_description, full_description, category_id, tags, developer_name, version, icon_url, thumbnail_url, banner_url, website_url, documentation_url, github_url, demo_url, link_type, pricing_type, status, is_featured, is_popular, is_premium, is_published, is_archived, language, sort_order, stats_views, stats_clicks, stats_favorites, stats_shares, stats_downloads, stats_rating_sum, stats_rating_count) values
  ('ChatGPT', 'chatgpt', 'Conversational AI assistant by OpenAI', 'ChatGPT is a conversational AI assistant that can help with writing, coding, brainstorming, research, and more. Powered by GPT-4o, it understands natural language and generates human-like responses.', v_ai, array['assistant','gpt','openai','chatbot'], 'OpenAI', 'GPT-4o', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600', 'https://images.unsplash.com/photo-1620712943543-b6b9dec52550?w=1200', 'https://chat.openai.com', 'https://platform.openai.com/docs', 'https://github.com/openai', 'https://chat.openai.com', 'external', 'freemium', 'active', true, true, false, true, false, 'en', 1, 152340, 89234, 12450, 3200, 1100, 4.7*18200, 18200),
  ('Claude', 'claude', 'AI assistant by Anthropic for analysis and writing', 'Claude is an AI assistant built by Anthropic focused on being helpful, harmless, and honest. It excels at long-form writing, code analysis, research, and thoughtful conversation.', v_ai, array['assistant','anthropic','claude','analysis'], 'Anthropic', 'Claude 3.5 Sonnet', 'https://images.unsplash.com/photo-1684163761261-3dfdc5d7e4a1?w=200', 'https://images.unsplash.com/photo-1684163761261-3dfdc5d7e4a1?w=600', 'https://images.unsplash.com/photo-1620712943543-b6b9dec52550?w=1200', 'https://claude.ai', 'https://docs.anthropic.com', 'https://github.com/anthropics', 'https://claude.ai', 'external', 'freemium', 'active', true, true, false, true, false, 'en', 2, 98230, 56100, 8900, 2100, 760, 4.6*12100, 12100),
  ('Gemini', 'gemini', 'Google''s multimodal AI assistant', 'Gemini is Google''s multimodal AI model that can reason across text, images, audio, video, and code. Integrated with Google Workspace for productivity.', v_ai, array['assistant','google','gemini','multimodal'], 'Google', 'Gemini 1.5 Pro', 'https://images.unsplash.com/photo-1618005182384-a83a8bd0c1e8?w=200', 'https://images.unsplash.com/photo-1618005182384-a83a8bd0c1e8?w=600', 'https://images.unsplash.com/photo-1620712943543-b6b9dec52550?w=1200', 'https://gemini.google.com', 'https://ai.google.dev/docs', 'https://github.com/google', 'https://gemini.google.com', 'external', 'freemium', 'active', true, true, false, true, false, 'en', 3, 87100, 49000, 7200, 1900, 540, 4.5*9800, 9800),
  ('Bolt', 'bolt', 'AI-powered full-stack web app builder', 'Bolt.new lets you prompt, build, and deploy full-stack web and mobile apps in your browser. Powered by AI, it handles the entire stack from frontend to backend.', v_web, array['builder','ai','fullstack','vite'], 'StackBlitz', '1.0', 'https://images.unsplash.com/photo-1555066931-4365d14b5e6c?w=200', 'https://images.unsplash.com/photo-1555066931-4365d14b5e6c?w=600', 'https://images.unsplash.com/photo-1460925895917-1b9b281b9a5d?w=1200', 'https://bolt.new', 'https://bolt.new/docs', 'https://github.com/stackblitz', 'https://bolt.new', 'external', 'freemium', 'active', true, true, true, true, false, 'en', 4, 65400, 38200, 6100, 1500, 420, 4.8*7600, 7600),
  ('Lovable', 'lovable', 'Build apps by chatting with AI', 'Lovable is an AI-powered app builder where you describe what you want and it generates a working full-stack application you can deploy instantly.', v_web, array['builder','ai','nocode'], 'Lovable', '1.0', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600', 'https://images.unsplash.com/photo-1460925895917-1b9b281b9a5d?w=1200', 'https://lovable.dev', 'https://lovable.dev/docs', '', 'https://lovable.dev', 'external', 'freemium', 'active', false, true, true, true, false, 'en', 5, 43200, 24100, 3800, 920, 280, 4.4*4900, 4900),
  ('Cursor', 'cursor', 'The AI code editor built for productivity', 'Cursor is an AI-first code editor that helps you write, refactor, and understand code faster. Built on VS Code with deep AI integration.', v_prog, array['editor','ai','code','vscode'], 'Anysphere', '0.42', 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=200', 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600', 'https://images.unsplash.com/photo-1555066931-4365d14b5e6c?w=1200', 'https://cursor.com', 'https://cursor.com/docs', 'https://github.com/getcursor', 'https://cursor.com', 'external', 'freemium', 'active', true, true, true, true, false, 'en', 6, 78900, 45000, 7800, 2200, 610, 4.7*9200, 9200),
  ('Perplexity', 'perplexity', 'AI-powered answer engine with sources', 'Perplexity is an AI-powered search and answer engine that provides cited, up-to-date answers to any question. Great for research and learning.', v_res, array['search','research','ai','answers'], 'Perplexity AI', '1.0', 'https://images.unsplash.com/photo-1592434134753-a70baf7979d5?w=200', 'https://images.unsplash.com/photo-1592434134753-a70baf7979d5?w=600', 'https://images.unsplash.com/photo-1460925895917-1b9b281b9a5d?w=1200', 'https://www.perplexity.ai', 'https://docs.perplexity.ai', '', 'https://www.perplexity.ai', 'external', 'freemium', 'active', false, true, false, true, false, 'en', 7, 56000, 31000, 4900, 1300, 350, 4.5*6100, 6100),
  ('DeepSeek', 'deepseek', 'Open and efficient AI models', 'DeepSeek provides powerful open-source AI models for reasoning, coding, and math. Cost-effective alternative with strong performance benchmarks.', v_ai, array['assistant','opensource','reasoning','coding'], 'DeepSeek', 'V3', 'https://images.unsplash.com/photo-1655720828019-edd6274f3bce?w=200', 'https://images.unsplash.com/photo-1655720828019-edd6274f3bce?w=600', 'https://images.unsplash.com/photo-1620712943543-b6b9dec52550?w=1200', 'https://chat.deepseek.com', 'https://api-docs.deepseek.com', 'https://github.com/deepseek-ai', 'https://chat.deepseek.com', 'external', 'free', 'active', false, true, false, true, false, 'en', 8, 41000, 22800, 3600, 880, 240, 4.3*4200, 4200),
  ('Gamma', 'gamma', 'AI-powered presentations and documents', 'Gamma is an AI tool that generates beautiful presentations, documents, and websites in seconds. Just type a prompt and get a polished deck.', v_prod, array['presentations','ai','design','docs'], 'Gamma', '1.0', 'https://images.unsplash.com/photo-1531403009284-440e0d9b5317?w=200', 'https://images.unsplash.com/photo-1531403009284-440e0d9b5317?w=600', 'https://images.unsplash.com/photo-1531403009284-440e0d9b5317?w=1200', 'https://gamma.app', 'https://gamma.app/docs', '', 'https://gamma.app', 'external', 'freemium', 'active', false, true, false, true, false, 'en', 9, 33400, 18600, 2900, 760, 190, 4.4*3400, 3400),
  ('Midjourney', 'midjourney', 'AI image generation with stunning quality', 'Midjourney is an AI image generator that creates stunning, artistic images from text prompts. Known for its distinctive aesthetic and quality.', v_image, array['image','ai','art','generation'], 'Midjourney', 'V6', 'https://images.unsplash.com/photo-1675271591211-627b5b1f3e3e?w=200', 'https://images.unsplash.com/photo-1675271591211-627b5b1f3e3e?w=600', 'https://images.unsplash.com/photo-1567091163932-0ef1f3c41b27?w=1200', 'https://www.midjourney.com', 'https://docs.midjourney.com', '', 'https://www.midjourney.com', 'external', 'paid', 'active', false, true, true, true, false, 'en', 10, 71200, 39800, 6800, 1800, 520, 4.6*8900, 8900),
  ('Runway', 'runway', 'AI video generation and editing tools', 'Runway is an AI video platform for generating, editing, and manipulating video. Tools for text-to-video, motion brush, and creative video production.', v_video, array['video','ai','generation','editing'], 'Runway AI', 'Gen-3', 'https://images.unsplash.com/photo-1492691527719-9d1e803f5e44?w=200', 'https://images.unsplash.com/photo-1492691527719-9d1e803f5e44?w=600', 'https://images.unsplash.com/photo-1574717065658-3a8f9c3f0e5e?w=1200', 'https://runwayml.com', 'https://runwayml.com/docs', '', 'https://runwayml.com', 'external', 'freemium', 'active', false, true, true, true, false, 'en', 11, 28900, 16200, 2400, 640, 170, 4.3*2800, 2800),
  ('Notion AI', 'notion-ai', 'AI workspace for notes, docs, and productivity', 'Notion AI brings AI into your workspace — summarize notes, draft content, answer questions, and automate your knowledge base.', v_prod, array['productivity','notes','ai','workspace'], 'Notion', '1.0', 'https://images.unsplash.com/photo-1517842645767-c63900b434e0?w=200', 'https://images.unsplash.com/photo-1517842645767-c63900b434e0?w=600', 'https://images.unsplash.com/photo-1499750310107-5fef28a2ea3f?w=1200', 'https://www.notion.so/product/ai', 'https://www.notion.so/help/ai', '', 'https://www.notion.so', 'external', 'freemium', 'active', false, true, false, true, false, 'en', 12, 38800, 21500, 3400, 910, 230, 4.5*4100, 4100)
  on conflict (slug) do nothing;
end $$;

-- ================= Resources =================
insert into resources (title, slug, description, category_id, resource_type, thumbnail_url, url, author, tags, is_premium, status, sort_order) values
('Full-Stack Development with AI', 'full-stack-ai-course', 'A complete course on building modern web apps with AI assistance.', (select id from categories where slug='web-development'), 'course', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600', 'https://example.com/course', 'TEAM EDU', array['course','fullstack','ai'], false, 'published', 1),
('Introduction to Machine Learning', 'intro-ml-book', 'A free book covering ML fundamentals, algorithms, and applications.', (select id from categories where slug='artificial-intelligence'), 'book', 'https://images.unsplash.com/photo-1532010021966-a15a51d24b5c?w=600', 'https://example.com/ml-book', 'Dr. Alan Turing', array['book','ml','ai'], false, 'published', 2),
('React + TypeScript Best Practices', 'react-ts-pdf', 'A PDF guide on building type-safe React applications.', (select id from categories where slug='programming'), 'pdf', 'https://images.unsplash.com/photo-1633356122544-87ee0ee6d4f3?w=600', 'https://example.com/react-ts', 'TEAM EDU', array['pdf','react','typescript'], true, 'published', 3),
('Building with Bolt — Video Tutorial', 'bolt-video', 'Learn to build full-stack apps with Bolt.new in this video series.', (select id from categories where slug='web-development'), 'video', 'https://images.unsplash.com/photo-1611162617474-5b21e879e7d2?w=600', 'https://youtube.com/watch?v=example', 'StackBlitz', array['video','bolt','tutorial'], false, 'published', 4),
('Supabase Documentation', 'supabase-docs', 'Official documentation for Supabase — the open Firebase alternative.', (select id from categories where slug='cloud-computing'), 'documentation', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600', 'https://supabase.com/docs', 'Supabase', array['docs','supabase','backend'], false, 'published', 5),
('Awesome AI Tools — GitHub', 'awesome-ai-tools', 'A curated list of AI tools and resources on GitHub.', (select id from categories where slug='artificial-intelligence'), 'github', 'https://images.unsplash.com/photo-1618401471833-6c5e9e2c0e0f?w=600', 'https://github.com/awesome-ai-tools', 'Open Source', array['github','ai','list'], false, 'published', 6),
('UI/UX Design Principles', 'uiux-design', 'A comprehensive guide to modern interface design.', (select id from categories where slug='design'), 'book', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600', 'https://example.com/uiux', 'TEAM EDU', array['book','design','uiux'], true, 'published', 7),
('Prompt Engineering 101', 'prompt-engineering', 'Learn how to write effective prompts for AI models.', (select id from categories where slug='artificial-intelligence'), 'course', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600', 'https://example.com/prompt-eng', 'TEAM EDU', array['course','prompts','ai'], false, 'published', 8)
on conflict (slug) do nothing;

-- ================= Providers =================
insert into providers (name, slug, description, base_url, model, temperature, max_tokens, status, icon_url) values
('OpenAI', 'openai', 'GPT models for chat, completion, and embeddings', 'https://api.openai.com/v1', 'gpt-4o', 0.7, 4096, 'active', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200'),
('Anthropic', 'anthropic', 'Claude models for analysis and conversation', 'https://api.anthropic.com/v1', 'claude-3-5-sonnet', 0.7, 4096, 'active', 'https://images.unsplash.com/photo-1684163761261-3dfdc5d7e4a1?w=200'),
('Google Gemini', 'google-gemini', 'Multimodal AI by Google', 'https://generativelanguage.googleapis.com/v1', 'gemini-1.5-pro', 0.7, 4096, 'active', 'https://images.unsplash.com/photo-1618005182384-a83a8bd0c1e8?w=200'),
('DeepSeek', 'deepseek', 'Open and efficient reasoning models', 'https://api.deepseek.com/v1', 'deepseek-chat', 0.7, 4096, 'active', 'https://images.unsplash.com/photo-1655720828019-edd6274f3bce?w=200'),
('Perplexity', 'perplexity', 'Answer engine with citations', 'https://api.perplexity.ai', 'sonar', 0.7, 4096, 'inactive', 'https://images.unsplash.com/photo-1592434134753-a70baf7979d5?w=200'),
('Mistral', 'mistral', 'Open-weight European AI models', 'https://api.mistral.ai/v1', 'mistral-large', 0.7, 4096, 'inactive', 'https://images.unsplash.com/photo-1620712943543-b6b9dec52550?w=200'),
('OpenRouter', 'openrouter', 'Unified API for many AI models', 'https://openrouter.ai/api/v1', 'auto', 0.7, 4096, 'inactive', 'https://images.unsplash.com/photo-1555066931-4365d14b5e6c?w=200')
on conflict (slug) do nothing;
