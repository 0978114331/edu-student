/*
# EDU Platform — Site Content CMS

## Overview
A key-value `site_content` table that stores all editable page content (hero text, features, FAQ, contact info, pricing, stats, testimonials display).
Admin can edit everything via the Admin Dashboard, and the Frontend reads from this table in real-time.

## New Table

### site_content
- `id` (uuid, PK)
- `section` (text, not null) — e.g. "hero", "features", "faq", "contact", "pricing", "stats"
- `key` (text, not null) — e.g. "hero.title", "faq.q1"
- `value_en` (text) — English value
- `value_km` (text) — Khmer value
- `updated_at` (timestamptz)
- Unique constraint on (section, key)

## Security
- Public read (anon + authenticated) — so the frontend can display content
- Admin-only write (insert, update, delete) via is_admin() check
*/

CREATE TABLE IF NOT EXISTS site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  key text NOT NULL,
  value_en text,
  value_km text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (section, key)
);
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_content_read" ON site_content;
CREATE POLICY "site_content_read" ON site_content FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "site_content_admin_insert" ON site_content;
CREATE POLICY "site_content_admin_insert" ON site_content FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "site_content_admin_update" ON site_content;
CREATE POLICY "site_content_admin_update" ON site_content FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "site_content_admin_delete" ON site_content;
CREATE POLICY "site_content_admin_delete" ON site_content FOR DELETE
  TO authenticated USING (public.is_admin());

-- Seed: Hero section
INSERT INTO site_content (section, key, value_en, value_km) VALUES
('hero', 'badge', 'AI-powered education for everyone', 'អប់រំដោយ AI សម្រាប់ទាំងអស់គ្នា'),
('hero', 'title', 'Learn smarter with', 'រៀនឱ្យឆ្លាតជាមួយ'),
('hero', 'title.highlight', 'AI-powered tools', 'ឧបករណ៍ដែលដំណើរការដោយ AI'),
('hero', 'subtitle', 'Access 16+ AI tools, thousands of educational resources, and a personal AI assistant — all in one platform built for students.', 'ចូលប្រើឧបករណ៍ AI ជាង ១៦ ប្រភេទ ធនធានអប់រំជាច្រើន និងជំនួយការ AI ផ្ទាល់ខ្លួន — ទាំងអស់ក្នុងវេទិកាមួយដែលបង្កើតសម្រាប់សិស្ស។'),
('hero', 'search.placeholder', 'Search tools, resources, courses...', 'ស្វែងរកឧបករណ៍ ធនធាន វគ្គសិក្សា...'),
('hero', 'search.button', 'Search', 'ស្វែងរក'),
('hero', 'cta.primary', 'Explore AI Tools', 'ស្វែងរកឧបករណ៍ AI'),
('hero', 'cta.secondary', 'Browse Resources', 'មើលធនធាន')
ON CONFLICT (section, key) DO NOTHING;

-- Seed: Stats section
INSERT INTO site_content (section, key, value_en, value_km) VALUES
('stats', 'tools', 'AI Tools', 'ឧបករណ៍ AI'),
('stats', 'resources', 'Resources', 'ធនធាន'),
('stats', 'students', 'Students', 'សិស្ស'),
('stats', 'countries', 'Countries', 'ប្រទេស')
ON CONFLICT (section, key) DO NOTHING;

-- Seed: Features section
INSERT INTO site_content (section, key, value_en, value_km) VALUES
('features', 'title', 'Why choose EDU?', 'ហេតុអ្វីជ្រើសរើស EDU?'),
('features', 'desc', 'Everything you need to learn faster and smarter', 'អ្វីៗទាំងអស់ដែលអ្នកត្រូវការដើម្បីរៀនលឿន និងឆ្លាតជាងមុន'),
('features', 'aiLearning.title', 'AI-Powered Learning', 'ការរៀនដោយ AI'),
('features', 'aiLearning.desc', '16+ specialized AI tools to help you study, write, code, and research.', 'ឧបករណ៍ AI ជាង ១៦ ប្រភេទ ដែលជួយឲ្យអ្នកសិក្សា សរសេរ កូដ និងស្រាវជ្រាវ។'),
('features', 'resources.title', 'Rich Resources', 'ធនធានសម្បូរបែប'),
('features', 'resources.desc', 'Courses, e-books, videos, and exercises — all in one place.', 'វគ្គសិក្សា សៀវភៅអេឡិចត្រូនិក វីដេអូ និងលំហាត់ — ទាំងអស់ក្នុងមួយកន្លែង។'),
('features', 'fast.title', 'Fast & Reliable', 'លឿន និងទៀងទាត់'),
('features', 'fast.desc', 'Optimized for speed with instant AI responses and smooth UX.', 'បង្កើនប្រសិទ្ធភាពភាពលឿន ជាមួយការឆ្លើយតប AI ភ្លាមៗ និង UX រលូន។'),
('features', 'secure.title', 'Secure & Private', 'សុវត្ថិភាព និងឯកជន'),
('features', 'secure.desc', 'Row-level security, JWT auth, and encrypted data storage.', 'សុវត្ថិភាពកម្រិតជួរ ការផ្ទៀងផ្ទាត់ JWT និងការរក្សាទុកទិន្នន័យដោយអ៊ីនគ្រីប។'),
('features', 'multilang.title', 'Multi-language Ready', 'គាំទ្រច្រើនភាសា'),
('features', 'multilang.desc', 'Designed for Khmer, English, Thai, and Vietnamese support.', 'រចនាសម្ព័ន្ធសម្រាប់ខ្មែរ អង់គ្លេស ថៃ និងវៀតណាម។'),
('features', 'pro.title', 'Pro Experience', 'បទពិសោធន៍ Pro'),
('features', 'pro.desc', 'Unlock unlimited usage, premium tools, and priority support.', 'ដោះស្រាយការប្រើមិនកំណត់ ឧបករណ៍ពិសេស និងគាំទ្រអាទិភាព។')
ON CONFLICT (section, key) DO NOTHING;

-- Seed: FAQ section
INSERT INTO site_content (section, key, value_en, value_km) VALUES
('faq', 'q1', 'What is EDU?', 'EDU ជាអ្វី?'),
('faq', 'a1', 'EDU is an all-in-one AI-powered education platform where students can learn, access educational resources, and use powerful AI tools.', 'EDU ជាវេទិកាអប់រំដែលមាន AI ទាំងអស់ក្នុងមួយ ដែលសិស្សអាចរៀន ចូលប្រើធនធានអប់រំ និងប្រើឧបករណ៍ AI ដែលមានឥទ្ធិពល។'),
('faq', 'q2', 'Is EDU free to use?', 'តើ EDU ប្រើដោយឥតគិតទេឬ?'),
('faq', 'a2', 'Yes! The Free plan gives you limited daily AI usage and access to free educational content. Upgrade to Pro for unlimited usage and premium features.', 'បាទ! ផែនការដោយឥតគិតឲ្យអ្នកប្រើ AI កំណត់ប្រចាំថ្ងៃ និងចូលប្រើមាតិកាអប់រំដោយឥតគិត។ អាន់គ្រេតទៅ Pro សម្រាប់ការប្រើមិនកំណត់ និងមុខងារពិសេស។'),
('faq', 'q3', 'What is included in the Pro plan?', 'តើផែនការ Pro មានអ្វីខ្លះ?'),
('faq', 'a3', 'Pro includes unlimited AI usage, premium tools and courses, faster responses, priority support, cloud history, and advanced features.', 'Pro រួមមានការប្រើ AI មិនកំណត់ ឧបករណ៍ និងវគ្គសិក្សាពិសេស ការឆ្លើយតបលឿន គាំទ្រអាទិភាព ប្រវត្តិក្នុងពពក និងមុខងារកម្រិតខ្ពស់។'),
('faq', 'q4', 'Can I cancel my subscription anytime?', 'តើអាចបោះបង់ការត្រិតត្រូវបាននៅពេលណាឬ?'),
('faq', 'a4', 'Absolutely. You can cancel your Pro subscription at any time and continue using Free plan features.', 'បាទជាក់ជាក។ អ្នកអាចបោះបង់ការត្រិតត្រូវ Pro នៅពេលណាក៏បាន និងបន្តប្រើមុខងារផែនការដោយឥតគិត។'),
('faq', 'q5', 'Do I need to create an account?', 'តើត្រូវបង្កើតគណនីទេ?'),
('faq', 'a5', 'Guests can browse tools and view resources. To use AI tools and save favorites, create a free account.', 'ភ្ញៀវអាចមើលឧបករណ៍ និងធនធានបាន។ ដើម្បីប្រើឧបករណ៍ AI និងរក្សាទុកចំណូលចិត្ត សូមបង្កើតគណនីដោយឥតគិត។'),
('faq', 'q6', 'Which payment methods are supported?', 'តើគាំទ្រវិធីបង់ប្រាក់អ្វីខ្លះ?'),
('faq', 'a6', 'We support ABA Pay, KHQR, Visa/MasterCard, PayPal, and Stripe for secure upgrades.', 'យើងគាំទ្រ ABA Pay, KHQR, Visa/MasterCard, PayPal, និង Stripe សម្រាប់ការអាន់គ្រេតសុវត្ថិភាព។')
ON CONFLICT (section, key) DO NOTHING;

-- Seed: Contact section
INSERT INTO site_content (section, key, value_en, value_km) VALUES
('contact', 'title', 'Get in touch', 'ទាក់ទងមកយើង'),
('contact', 'desc', 'Have questions? We''d love to hear from you.', 'មានសំណួរ? យើងចង់ឮពីអ្នក។'),
('contact', 'email', 'Khouvchvea123@gmail.com', 'Khouvchvea123@gmail.com'),
('contact', 'phone', '+855 97 8114 331', '+855 97 8114 331'),
('contact', 'address', 'Phnom Penh, Cambodia', 'ភ្នំពេញ ប្រទេសកម្ពុជា')
ON CONFLICT (section, key) DO NOTHING;

-- Seed: Pricing section
INSERT INTO site_content (section, key, value_en, value_km) VALUES
('pricing', 'title', 'Choose your plan', 'ជ្រើសរើសផែនការរបស់អ្នក'),
('pricing', 'subtitle', 'Start free, upgrade when you''re ready. No hidden fees, cancel anytime.', 'ចាប់ផ្តើមដោយឥតគិត អាន់គ្រេតនៅពេលអ្នកត្រៀមខ្លួន។ មិនមានថ្លៃបន្ថែម បោះបង់នៅពេលណាក៏បាន។'),
('pricing', 'badge', 'Simple, transparent pricing', 'តម្លៃសាមញ្ញ ជាក់ស្តែង'),
('pricing', 'guest.name', 'Guest', 'ភ្ញៀវ'),
('pricing', 'guest.desc', 'For curious visitors', 'សម្រាប់ភ្ញៀវដែលចង់ដឹង'),
('pricing', 'guest.features', 'Browse AI tools, View educational resources, Read testimonials', 'មើលឧបករណ៍ AI, មើលធនធានអប់រំ, អានមតិសិស្ស'),
('pricing', 'free.name', 'Free', 'ដោយឥតគិត'),
('pricing', 'free.desc', 'For students starting out', 'សម្រាប់សិស្សដែលទើបចាប់ផ្តើម'),
('pricing', 'free.features', 'Limited AI usage per day, Access free educational content, Save favorites, Personal dashboard, Community access', 'ការប្រើ AI កំណត់ប្រចាំថ្ងៃ, ចូលប្រើមាតិកាដោយឥតគិត, រក្សាទុកចំណូលចិត្ត, ផ្ទាំងគ្រប់គ្រងផ្ទាល់ខ្លួន, ចូលប្រើសហគមន៍'),
('pricing', 'pro.name', 'Pro', 'Pro'),
('pricing', 'pro.desc', 'For serious learners', 'សម្រាប់អ្នករៀនពិតជា'),
('pricing', 'pro.features', 'Unlimited AI usage, All premium AI tools, Premium courses & resources, Faster AI response times, Priority support, Cloud history, Advanced features', 'ការប្រើ AI មិនកំណត់, ឧបករណ៍ AI ពិសេសទាំងអស់, វគ្គសិក្សា និងធនធានពិសេស, ការឆ្លើយតប AI លឿន, គាំទ្រអាទិភាព, ប្រវត្តិក្នុងពពក, មុខងារកម្រិតខ្ពស់')
ON CONFLICT (section, key) DO NOTHING;

-- Index
CREATE INDEX IF NOT EXISTS idx_site_content_section ON site_content(section);
