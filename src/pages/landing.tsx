import { useEffect, useState } from 'react';
import { useNavigate } from '@/lib/router';
import { supabase, type AITool, type Category } from '@/lib/supabase';
import { ToolCard } from '@/components/site/tool-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sparkles,
  ArrowRight,
  Search,
  Zap,
  ShieldCheck,
  Globe,
  Users,
  Star,
  TrendingUp,
  BookOpen,
  Layers,
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<AITool[]>([]);
  const [popular, setPopular] = useState<AITool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({ tools: 0, categories: 0, views: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [feat, pop, cats, toolCount] = await Promise.all([
        supabase.from('ai_tools').select('*, category:categories(*)').eq('is_published', true).eq('is_featured', true).order('sort_order').limit(8),
        supabase.from('ai_tools').select('*, category:categories(*)').eq('is_published', true).eq('is_popular', true).order('stats_views', { ascending: false }).limit(4),
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order').limit(8),
        supabase.from('ai_tools').select('id, stats_views, category_id').eq('is_published', true),
      ]);
      setFeatured(feat.data as AITool[]);
      setPopular(pop.data as AITool[]);
      setCategories(cats.data as Category[]);
      const rows = toolCount.data as any[];
      setStats({
        tools: rows.length,
        categories: new Set(rows.map((r) => r.category_id).filter(Boolean)).size,
        views: rows.reduce((s, r) => s + (r.stats_views || 0), 0),
      });
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 bg-radial-fade" />
        <div className="container relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 gap-1.5 bg-card/50 backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary" />
              AI-Powered Education Platform
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-balance">
              Discover, compare & use the best{' '}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                AI tools for education
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
              TEAM EDU brings together students, teachers, universities, and organizations with a curated
              marketplace of AI tools, educational resources, and intelligent assistants — all in one place.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" onClick={() => navigate('/tools')} className="gap-2">
                Explore AI Tools <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/signup')}>
                Get Started Free
              </Button>
            </div>

            {/* Search bar */}
            <div className="mt-10 max-w-xl mx-auto">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for AI tools, resources, categories..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate('/tools');
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-card/60 backdrop-blur border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 max-w-lg mx-auto">
              {[
                { label: 'AI Tools', value: stats.tools, icon: Layers },
                { label: 'Categories', value: stats.categories, icon: BookOpen },
                { label: 'Total Views', value: formatNum(stats.views), icon: TrendingUp },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Browse by Category</h2>
              <p className="text-muted-foreground mt-1">Explore tools across different fields and disciplines.</p>
            </div>
            <Button variant="ghost" onClick={() => navigate('/categories')} className="gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/tools?category=${c.slug}`)}
                className="group bg-card border border-border rounded-xl p-5 text-left hover:border-primary/50 hover:bg-muted/30 transition-all"
              >
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: (c.color || '#3b82f6') + '22' }}
                >
                  <div className="h-4 w-4 rounded" style={{ background: c.color || '#3b82f6' }} />
                </div>
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{c.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description || 'Explore tools'}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <Badge variant="outline" className="mb-2 gap-1">
                <Sparkles className="h-3 w-3 text-primary" /> Featured
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold">Featured AI Tools</h2>
            </div>
            <Button variant="ghost" onClick={() => navigate('/tools')} className="gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 rounded-xl shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((t) => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular */}
      {popular.length > 0 && (
        <section className="py-16 border-t border-border">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <Badge variant="outline" className="mb-2 gap-1">
                  <TrendingUp className="h-3 w-3 text-accent" /> Trending
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-bold">Most Popular</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {popular.map((t) => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold">Why TEAM EDU?</h2>
            <p className="text-muted-foreground mt-2">
              A complete platform built for modern education powered by AI.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'AI Tools Marketplace', desc: 'A curated catalog of AI tools for every learning need — from writing to coding to research.' },
              { icon: ShieldCheck, title: 'Enterprise-Grade Security', desc: 'Role-based access, secure authentication, and full audit logging keep your data safe.' },
              { icon: Globe, title: 'Dynamic & Scalable', desc: 'Administrators manage everything from the dashboard — no code changes needed to add tools.' },
              { icon: Users, title: 'Built for Everyone', desc: 'Students, teachers, universities, and organizations all in one platform.' },
              { icon: BookOpen, title: 'Rich Resources', desc: 'Courses, books, videos, and documentation curated for every category.' },
              { icon: Star, title: 'Ratings & Reviews', desc: 'Community-driven ratings help you find the best tools faster.' },
            ].map((f) => (
              <Card key={f.title} className="bg-card/50 border-border hover:border-primary/40 transition-colors">
                <CardContent className="pt-6">
                  <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-card border border-border p-10 sm:p-16 text-center">
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-balance">
                Ready to transform your learning with AI?
              </h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                Join TEAM EDU today and get access to the best AI tools, resources, and educational content — all in one platform.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" onClick={() => navigate('/signup')} className="gap-2">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/pricing')}>
                  View Pricing
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}
