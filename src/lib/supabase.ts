import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Plan = 'free' | 'pro';
export type Role = 'user' | 'admin';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: Plan;
  role: Role;
  created_at: string;
}

export interface AITool {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  category: string;
  is_pro: boolean;
  usage_limit_free: number;
  price: number;
  rating: number;
  reviews_count: number;
  created_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  item_type: 'tool' | 'plan';
  item_id: string | null;
  amount: number;
  currency: string;
  payment_method: string | null;
  status: 'pending' | 'completed' | 'failed';
  card_last4: string | null;
  created_at: string;
}

export interface Resource {
  id: string;
  name: string;
  description: string | null;
  type: string;
  category: string | null;
  image_url: string | null;
  is_premium: boolean;
  rating: number;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  tool_id: string;
  created_at: string;
}

export interface UsageLog {
  id: string;
  user_id: string;
  tool_id: string;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  avatar_url: string | null;
  text: string;
  rating: number;
  created_at: string;
}

export interface SiteStats {
  tools: number;
  resources: number;
  students: number;
  purchases: number;
  revenue: number;
}

export interface SiteContentRow {
  id: string;
  section: string;
  key: string;
  value_en: string | null;
  value_km: string | null;
  updated_at: string;
}
