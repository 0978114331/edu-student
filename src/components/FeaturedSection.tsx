import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import type { AITool, Resource } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import ToolCard from '@/components/ToolCard';
import ResourceCard from '@/components/ResourceCard';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LanguageContext';

export default function FeaturedSection() {
  const { session } = useAuth();
  const { t } = useLang();
  const [tools, setTools] = useState<AITool[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase
      .from('ai_tools')
      .select('*')
      .order('rating', { ascending: false })
      .limit(8)
      .then(({ data }) => setTools((data as AITool[]) ?? []));

    supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data }) => setResources((data as Resource[]) ?? []));
  }, []);

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

  return (
    <>
      <section className="section py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">{t('section.featured')}</span>
            </div>
            <h2 className="text-3xl font-extrabold">{t('section.featured.tools')}</h2>
          </div>
          <Link to="/tools" className="btn-outline hidden sm:inline-flex">
            {t('common.viewAll')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tools.map((tl) => (
            <ToolCard
              key={tl.id}
              tool={tl}
              isFavorite={favorites.has(tl.id)}
              onToggleFavorite={session ? toggleFavorite : undefined}
            />
          ))}
        </div>
      </section>

      <section className="section py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-accent-600 dark:text-accent-400 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">{t('section.latest')}</span>
            </div>
            <h2 className="text-3xl font-extrabold">{t('section.latest.resources')}</h2>
          </div>
          <Link to="/resources" className="btn-outline hidden sm:inline-flex">
            {t('common.viewAll')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {resources.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      </section>
    </>
  );
}
