import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Star, Lock, BookOpen, Play, Download, ExternalLink, CheckCircle2 } from 'lucide-react';
import type { Resource } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LanguageContext';

const TYPE_ICON: Record<string, typeof BookOpen> = {
  course: BookOpen,
  ebook: BookOpen,
  document: BookOpen,
  video: Play,
  tutorial: Play,
  exercise: Download,
};

export default function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session, profile } = useAuth();
  const { t } = useLang();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        setResource(data as Resource | null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="pt-16 section py-20">
        <div className="card p-8 h-96 animate-pulse" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="pt-16 section py-20 text-center">
        <p className="text-slate-500">Resource not found.</p>
        <Link to="/resources" className="btn-primary mt-4">Back to Resources</Link>
      </div>
    );
  }

  const Icon = TYPE_ICON[resource.type] ?? BookOpen;
  const isPro = profile?.plan === 'pro';
  const canAccess = !resource.is_premium || isPro;
  const hasContent = !!resource.content_url;

  return (
    <div className="pt-16 min-h-screen">
      <div className="section py-10 max-w-4xl">
        <Link to="/resources" className="btn-ghost !pl-0 mb-6">
          <ArrowLeft className="w-4 h-4" /> {t('tool.backToTools')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: cover + meta */}
          <div className="lg:col-span-1">
            <div className="card overflow-hidden sticky top-24">
              <div className="relative h-48 overflow-hidden">
                {resource.image_url ? (
                  <img
                    src={resource.image_url}
                    alt={resource.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-500/20 to-accent-500/20" />
                )}
                <div className="absolute top-3 left-3">
                  {resource.is_premium ? (
                    <span className="badge-pro"><Lock className="w-3 h-3" /> {t('common.premium')}</span>
                  ) : (
                    <span className="badge-free">{t('common.free')}</span>
                  )}
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Icon className="w-4 h-4" />
                  <span className="capitalize">{resource.type}</span>
                  {resource.category && (
                    <>
                      <span>·</span>
                      <span>{resource.category}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{Number(resource.rating).toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: content */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h1 className="text-2xl font-extrabold">{resource.name}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                {resource.description}
              </p>

              <div className="mt-6">
                {canAccess ? (
                  hasContent ? (
                    <a
                      href={resource.content_url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t('tool.run')}
                    </a>
                  ) : (
                    <div className="p-4 rounded-lg glass text-sm text-slate-500 dark:text-slate-400">
                      {t('common.description')}: {resource.description ?? '—'}
                    </div>
                  )
                ) : (
                  <div className="p-4 rounded-lg bg-brand-50 dark:bg-brand-950/40">
                    <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 font-medium">
                      <Lock className="w-4 h-4" />
                      {t('tool.upgradeToPro')}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {t('tool.signUpToUse')}
                    </p>
                    {session ? (
                      <Link to="/pricing" className="btn-primary mt-3">
                        {t('tool.upgradeToPro')}
                      </Link>
                    ) : (
                      <Link to="/signup" className="btn-primary mt-3">
                        {t('tool.signUpToUse')}
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {canAccess && hasContent && (
                <div className="mt-6 p-4 rounded-xl glass">
                  <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-500" />
                    {t('tool.result')}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {resource.type === 'video' || resource.type === 'tutorial'
                      ? 'Click the button above to watch the video.'
                      : resource.type === 'exercise'
                        ? 'Click the button above to download the exercise.'
                        : 'Click the button above to access the full content.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
