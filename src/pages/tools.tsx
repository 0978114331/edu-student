import { useEffect, useMemo, useState } from 'react';
import { useRoute, useNavigate } from '@/lib/router';
import { supabase, type AITool, type Category } from '@/lib/supabase';
import { ToolCard } from '@/components/site/tool-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export function ToolsPage() {
  const route = useRoute();
  const navigate = useNavigate();
  const initialCategory = route.query.get('category') || 'all';
  const initialQ = route.query.get('q') || '';

  const [tools, setTools] = useState<AITool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('popular');
  const [filter, setFilter] = useState<'all' | 'free' | 'premium' | 'featured'>('all');

  useEffect(() => {
    (async () => {
      const [toolsRes, catsRes] = await Promise.all([
        supabase.from('ai_tools').select('*, category:categories(*)').eq('is_published', true).eq('is_archived', false),
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
      ]);
      setTools((toolsRes.data as AITool[]) || []);
      setCategories((catsRes.data as Category[]) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = [...tools];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.short_description || '').toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)),
      );
    }
    if (category !== 'all') {
      const cat = categories.find((c) => c.slug === category);
      if (cat) list = list.filter((t) => t.category_id === cat.id);
    }
    if (filter === 'free') list = list.filter((t) => t.pricing_type === 'free');
    if (filter === 'premium') list = list.filter((t) => t.is_premium);
    if (filter === 'featured') list = list.filter((t) => t.is_featured);

    switch (sort) {
      case 'popular':
        list.sort((a, b) => b.stats_views - a.stats_views);
        break;
      case 'rating':
        list.sort((a, b) => b.stats_rating_sum / Math.max(1, b.stats_rating_count) - a.stats_rating_sum / Math.max(1, a.stats_rating_count));
        break;
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }
    return list;
  }, [tools, query, category, sort, filter, categories]);

  const activeCat = categories.find((c) => c.slug === category);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">AI Tools Marketplace</h1>
          <p className="text-muted-foreground mt-2">
            Browse {tools.length} AI tools across {categories.length} categories.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-xl border border-border rounded-xl p-4 mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools by name, description, or tag..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="name">A–Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            {(['all', 'free', 'premium', 'featured'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors capitalize ${
                  filter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
            {activeCat && (
              <Badge variant="secondary" className="gap-1 ml-auto">
                {activeCat.name}
                <button onClick={() => setCategory('all')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 rounded-xl shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No tools match your search. Try a different filter.</p>
            <Button variant="outline" className="mt-4" onClick={() => { setQuery(''); setCategory('all'); setFilter('all'); }}>
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">{filtered.length} tools found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filtered.map((t) => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
