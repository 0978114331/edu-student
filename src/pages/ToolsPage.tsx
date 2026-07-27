import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Star } from 'lucide-react';
import type { AITool } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { TOOL_CATEGORIES, getToolIcon } from '@/data/catalog';
import ToolCard from '@/components/ToolCard';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LanguageContext';

type SortKey = 'rating' | 'name' | 'newest';

export default function ToolsPage() {
  const { session } = useAuth();
  const { t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tools, setTools] = useState<AITool[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>('rating');
  const [filterPro, setFilterPro] = useState<'all' | 'free' | 'pro'>('all');

  const q = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';

  useEffect(() => {
    setLoading(true);
    let query = supabase.from('ai_tools').select('*');
    if (category) query = query.eq('category', category);
    if (filterPro === 'free') query = query.eq('is_pro', false);
    if (filterPro === 'pro') query = query.eq('is_pro', true);
    query
      .order(sort === 'rating' ? 'rating' : sort === 'newest' ? 'created_at' : 'name', {
        ascending: sort === 'name',
      })
      .then(({ data }) => {
        setTools((data as AITool[]) ?? []);
        setLoading(false);
      });
  }, [category, filterPro, sort]);

  useEffect(() => {
    if (!session?.user) return;
    supabase
      .from('favorites')
      .select('tool_id')
      .eq('user_id', session.user.id)
      .then(({ data }) => {
        if (data) setFavorites(new Set(data.map((d) => (d as { tool_id: string }).tool_id)));
      });
  }, [session]);

  const filtered = useMemo(() => {
    if (!q) return tools;
    const lower = q.toLowerCase();
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(lower) ||
        (t.description ?? '').toLowerCase().includes(lower),
    );
  }, [tools, q]);

  async function toggleFavorite(toolId: string) {
    if (!session?.user) return;
    if (favorites.has(toolId)) {
      setFavorites((prev) => {
        const next = new Set(prev);
        next.delete(toolId);
        return next;
      });
      await supabase.from('favorites').delete().eq('tool_id', toolId).eq('user_id', session.user.id);
    } else {
      setFavorites((prev) => new Set(prev).add(toolId));
      await supabase.from('favorites').insert({ tool_id: toolId, user_id: session.user.id });
    }
  }

  function setCategory(c: string) {
    const next = new URLSearchParams(searchParams);
    if (c) next.set('category', c);
    else next.delete('category');
    setSearchParams(next);
  }

  return (
    <div className="pt-16 min-h-screen">
      <div className="section py-10">
        <h1 className="text-3xl font-extrabold">{t('tools.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          {t('tools.subtitle', { count: tools.length })}
        </p>

        {/* Search + filters */}
        <div className="mt-6 flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              value={q}
              onChange={(e) => {
                const next = new URLSearchParams(searchParams);
                if (e.target.value) next.set('q', e.target.value);
                else next.delete('q');
                setSearchParams(next);
              }}
              placeholder={t('tools.searchPlaceholder')}
              className="input !pl-12"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={filterPro}
              onChange={(e) => setFilterPro(e.target.value as typeof filterPro)}
              className="input !w-auto"
            >
              <option value="all">{t('tools.allPlans')}</option>
              <option value="free">{t('common.free')}</option>
              <option value="pro">{t('common.pro')}</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="input !w-auto"
            >
              <option value="rating">{t('tools.topRated')}</option>
              <option value="newest">{t('tools.newest')}</option>
              <option value="name">A–Z</option>
            </select>
          </div>
        </div>

        {/* Category chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('')}
            className={`badge transition ${
              !category
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All
          </button>
          {TOOL_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`badge transition ${
                category === c
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card p-5 h-56 animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded mt-4 w-2/3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded mt-2" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded mt-1 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500 dark:text-slate-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>{t('tools.noResults')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8">
            {filtered.map((t) => (
              <ToolCard
                key={t.id}
                tool={t}
                isFavorite={favorites.has(t.id)}
                onToggleFavorite={session ? toggleFavorite : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
