import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AITool = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  category_id: string | null;
  tags: string[];
  developer_name: string | null;
  version: string | null;
  icon_url: string | null;
  thumbnail_url: string | null;
  banner_url: string | null;
  website_url: string | null;
  documentation_url: string | null;
  github_url: string | null;
  demo_url: string | null;
  link_type: string;
  pricing_type: string;
  status: string;
  is_featured: boolean;
  is_popular: boolean;
  is_premium: boolean;
  is_published: boolean;
  is_archived: boolean;
  language: string;
  sort_order: number;
  stats_views: number;
  stats_clicks: number;
  stats_favorites: number;
  stats_shares: number;
  stats_downloads: number;
  stats_rating_sum: number;
  stats_rating_count: number;
  created_at: string;
  updated_at: string;
  category?: Category | null;
};

export type Resource = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  resource_type: string;
  thumbnail_url: string | null;
  url: string | null;
  author: string | null;
  tags: string[];
  is_premium: boolean;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: Category | null;
};

export type Provider = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  api_key: string | null;
  base_url: string | null;
  model: string | null;
  temperature: number;
  max_tokens: number;
  status: string;
  icon_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Settings = {
  id: string;
  site_name: string;
  tagline: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  default_theme: string;
  homepage_banner_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  google_analytics_id: string | null;
  smtp_host: string | null;
  telegram_bot_token: string | null;
  maintenance_mode: boolean;
  default_language: string;
  timezone: string;
  created_at: string;
  updated_at: string;
};

export type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
};

export type Favorite = {
  id: string;
  user_id: string;
  tool_id: string;
  created_at: string;
  tool?: AITool;
};

export type RecentlyUsed = {
  id: string;
  user_id: string;
  tool_id: string;
  usage_count: number;
  last_accessed_at: string;
  tool?: AITool;
};

export type Review = {
  id: string;
  tool_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export type ActivityLog = {
  id: string;
  actor: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: any;
  created_at: string;
};

export function toolRating(tool: AITool): number {
  if (!tool.stats_rating_count || tool.stats_rating_count === 0) return 0;
  return tool.stats_rating_sum / tool.stats_rating_count;
}
