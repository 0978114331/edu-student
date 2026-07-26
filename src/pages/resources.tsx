import { useEffect, useMemo, useState } from 'react';
import { supabase, type Resource, type Category } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, BookOpen, Video, FileText, Github, ExternalLink, Crown, GraduationCap } from 'lucide-react';

const TYPE_ICONS: Record<string, any> = {
  course: GraduationCap,
  book: BookOpen,
  pdf: FileText,
  video: Video,
  documentation: BookOpen,
  github: Github,
  website: ExternalLink,
};

export function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [type, setType] = useState('all');

  useEffect(() => {
    (async () => {
      const [res, cats] = await Promise.all([
        supabase.from('resources').select('*, category:categories(*)').eq('status', 'published').order('sort_order'),
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
      ]);
      setResources((res.data as Resource[]) || []);
      setCategories((cats.data as Category[]) || []);
      setLoading(false);
    })();
  }, []);

  const types = useMemo(() => Array.from(new Set(resources.map((r) => r.resource_type))), [resources]);

  const filtered = useMemo(() => {
    let list = resources;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((r) => r.title.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q));
    }
    if (category !== 'all') {
      const c = categories.find((x) => x.slug === category);
      if (c) list = list.filter((r) => r.category_id === c.id);
    }
    if (type !== 'all') list = list.filter((r) => r.resource_type === type);
    return list;
  }, [resources, query, category, type, categories]);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">Educational Resources</h1>
          <p className="text-muted-foreground mt-2">Courses, books, videos, and documentation to accelerate your learning.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search resources..." className="pl-10" />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (<SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map((t) => (<SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-48 rounded-xl shimmer" />))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No resources found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((r) => {
              const Icon = TYPE_ICONS[r.resource_type] || BookOpen;
              return (
                <a
                  key={r.id}
                  href={r.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <Card className="h-full overflow-hidden hover:border-primary/50 transition-all">
                    <div className="relative h-36 overflow-hidden bg-muted">
                      {r.thumbnail_url ? (
                        <img src={r.thumbnail_url} alt={r.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <Icon className="h-10 w-10 text-primary/50" />
                        </div>
                      )}
                      {r.is_premium && (
                        <Badge className="absolute top-2.5 right-2.5 bg-warning/90 text-warning-foreground gap-1">
                          <Crown className="h-3 w-3" /> Premium
                        </Badge>
                      )}
                    </div>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="capitalize gap-1">
                          <Icon className="h-3 w-3" /> {r.resource_type}
                        </Badge>
                        {r.category && <span className="text-xs text-muted-foreground">{r.category.name}</span>}
                      </div>
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">{r.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</p>
                      {r.author && <p className="text-xs text-muted-foreground mt-2">by {r.author}</p>}
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
