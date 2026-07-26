import { useEffect, useState } from 'react';
import { useNavigate } from '@/lib/router';
import { supabase, type Category } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';

export function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [cats, tools] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('ai_tools').select('category_id').eq('is_published', true),
      ]);
      const c = (cats.data as Category[]) || [];
      setCategories(c);
      const map: Record<string, number> = {};
      (tools.data || []).forEach((t: any) => {
        if (t.category_id) map[t.category_id] = (map[t.category_id] || 0) + 1;
      });
      setCounts(map);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">All Categories</h1>
          <p className="text-muted-foreground mt-2">Explore AI tools and resources across {categories.length} categories.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (<div key={i} className="h-28 rounded-xl shimmer" />))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((c) => (
              <button key={c.id} onClick={() => navigate(`/tools?category=${c.slug}`)} className="text-left">
                <Card className="hover:border-primary/50 hover:bg-muted/30 transition-all h-full">
                  <CardContent className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: (c.color || '#3b82f6') + '22' }}>
                      <div className="h-5 w-5 rounded" style={{ background: c.color || '#3b82f6' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{c.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{c.description || 'Explore tools'}</p>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{counts[c.id] || 0}</span>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
