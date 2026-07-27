import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import type { Resource } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { RESOURCE_TYPES } from '@/data/catalog';
import ResourceCard from '@/components/ResourceCard';
import { useLang } from '@/context/LanguageContext';

export default function ResourcesPage() {
  const { t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const q = searchParams.get('q') ?? '';
  const type = searchParams.get('type') ?? '';

  useEffect(() => {
    setLoading(true);
    let query = supabase.from('resources').select('*');
    if (type) query = query.eq('type', type);
    query
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setResources((data as Resource[]) ?? []);
        setLoading(false);
      });
  }, [type]);

  const filtered = useMemo(() => {
    if (!q) return resources;
    const lower = q.toLowerCase();
    return resources.filter(
      (r) =>
        r.name.toLowerCase().includes(lower) ||
        (r.description ?? '').toLowerCase().includes(lower) ||
        (r.category ?? '').toLowerCase().includes(lower),
    );
  }, [resources, q]);

  function setType(t: string) {
    const next = new URLSearchParams(searchParams);
    if (t) next.set('type', t);
    else next.delete('type');
    setSearchParams(next);
  }

  return (
    <div className="pt-16 min-h-screen">
      <div className="section py-10">
        <h1 className="text-3xl font-extrabold">{t('section.latest.resources')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          {t('feature.resources.desc')}
        </p>

        <div className="mt-6 relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            value={q}
            onChange={(e) => {
              const next = new URLSearchParams(searchParams);
              if (e.target.value) next.set('q', e.target.value);
              else next.delete('q');
              setSearchParams(next);
            }}
            placeholder={t('common.search') + "..."}
            className="input !pl-12"
          />
        </div>

        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          <button
            onClick={() => setType('')}
            className={`badge transition ${!type ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
          >
            All
          </button>
          {RESOURCE_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`badge capitalize transition ${type === t ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500 dark:text-slate-400">
            <p>{t('tools.noResults')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
            {filtered.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
