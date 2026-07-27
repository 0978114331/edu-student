import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Heart,
  Clock,
  Sparkles,
  TrendingUp,
  Bell,
  Crown,
  Zap,
  ArrowRight,
} from 'lucide-react';
import type { AITool, UsageLog } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LanguageContext';
import { getToolIcon } from '@/data/catalog';

export default function DashboardPage() {
  const { session, profile, loading } = useAuth();
  const { t } = useLang();
  const [favorites, setFavorites] = useState<AITool[]>([]);
  const [recent, setRecent] = useState<AITool[]>([]);
  const [usageStats, setUsageStats] = useState<{ total: number; today: number }>({ total: 0, today: 0 });

  useEffect(() => {
    if (!session?.user) return;
    const uid = session.user.id;

    supabase
      .from('favorites')
      .select('tool_id, ai_tools(*)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const tools = ((data ?? []) as unknown as { ai_tools: AITool | null }[])
          .map((r) => r.ai_tools)
          .filter((t): t is AITool => !!t);
        setFavorites(tools);
      });

    supabase
      .from('usage_logs')
      .select('tool_id, created_at, ai_tools(*)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        const seen = new Set<string>();
        const tools: AITool[] = [];
        for (const r of (data ?? []) as unknown as { ai_tools: AITool | null; tool_id: string }[]) {
          if (r.ai_tools && !seen.has(r.tool_id)) {
            seen.add(r.tool_id);
            tools.push(r.ai_tools);
          }
        }
        setRecent(tools.slice(0, 6));
      });

    supabase
      .from('usage_logs')
      .select('id, created_at', { count: 'exact', head: false })
      .eq('user_id', uid)
      .then(({ data }) => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const today = ((data ?? []) as { created_at: string }[]).filter((r) => new Date(r.created_at) >= start).length;
        setUsageStats({ total: data?.length ?? 0, today });
      });
  }, [session]);

  if (loading) {
    return (
      <div className="pt-16 section py-20">
        <div className="card p-8 h-96 animate-pulse" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  const isPro = profile?.plan === 'pro';

  return (
    <div className="pt-16 min-h-screen">
      <div className="section py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 mb-1">
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-sm font-semibold">{t('dashboard.title')}</span>
            </div>
            <h1 className="text-3xl font-extrabold">
              {t('dashboard.welcome')}, {profile?.full_name || 'Student'}!
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isPro ? (
              <span className="badge-pro"><Crown className="w-3 h-3" /> {t('dashboard.proMember')}</span>
            ) : (
              <Link to="/pricing" className="btn-primary">
                <Crown className="w-4 h-4" /> {t('dashboard.upgradeToPro')}
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Sparkles} label={t('dashboard.totalUses')} value={usageStats.total} color="brand" />
          <StatCard icon={Zap} label={t('dashboard.usedToday')} value={usageStats.today} color="accent" />
          <StatCard icon={Heart} label={t('dashboard.favorites')} value={favorites.length} color="rose" />
          <StatCard icon={TrendingUp} label={t('common.plan')} value={isPro ? 'Pro' : 'Free'} color="amber" />
        </div>

        {/* Plan banner */}
        {!isPro && (
          <div className="glass-strong rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">{t('dashboard.upgradeBanner')}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t('dashboard.upgradeDesc')}
              </p>
            </div>
            <Link to="/pricing" className="btn-primary whitespace-nowrap">
              {t('dashboard.seePlans')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent tools */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-brand-500" />
              <h2 className="text-xl font-bold">{t('dashboard.recentlyUsed')}</h2>
            </div>
            {recent.length === 0 ? (
              <EmptyState text={t('tools.noResults')} cta />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {recent.map((t) => (
                  <MiniToolCard key={t.id} tool={t} />
                ))}
              </div>
            )}
          </section>

          {/* Favorites */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-rose-500" />
              <h2 className="text-xl font-bold">{t('dashboard.favoriteTools')}</h2>
            </div>
            {favorites.length === 0 ? (
              <EmptyState text="No favorites yet. Tap the heart on any tool to save it here." cta />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {favorites.map((t) => (
                  <MiniToolCard key={t.id} tool={t} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Notifications */}
        <section className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-brand-500" />
            <h2 className="text-xl font-bold">{t('dashboard.notifications')}</h2>
          </div>
          <div className="space-y-2">
            <NotificationRow
              title="Welcome to EDU!"
              text={t('hero.badge')}
              time="just now"
            />
            <NotificationRow
              title={t('section.featured.tools')}
              text={t('hero.subtitle')}
              time="2d ago"
            />
            {!isPro && (
              <NotificationRow
                title={t('dashboard.upgradeToPro')}
                text={t('dashboard.upgradeDesc')}
                time="this week"
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

const COLOR_MAP: Record<string, string> = {
  brand: 'from-brand-500/15 to-brand-500/5 text-brand-600 dark:text-brand-400',
  accent: 'from-accent-500/15 to-accent-500/5 text-accent-600 dark:text-accent-400',
  rose: 'from-rose-500/15 to-rose-500/5 text-rose-600 dark:text-rose-400',
  amber: 'from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-400',
};

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Zap;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="card p-5">
      <div className={`grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br ${COLOR_MAP[color]} mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}

function MiniToolCard({ tool }: { tool: AITool }) {
  const Icon = getToolIcon(tool.icon);
  return (
    <Link to={`/tools/${tool.slug}`} className="card p-4 flex flex-col items-center text-center gap-2">
      <div className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/15 to-accent-500/15 text-brand-600 dark:text-brand-400">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-medium line-clamp-1">{tool.name}</span>
    </Link>
  );
}

function EmptyState({ text, cta }: { text: string; cta?: boolean }) {
  const { t } = useLang();
  return (
    <div className="card p-8 text-center text-sm text-slate-500 dark:text-slate-400">
      <p>{text}</p>
      {cta && (
        <Link to="/tools" className="btn-outline mt-4">
          {t('common.viewAll')}
        </Link>
      )}
    </div>
  );
}

function NotificationRow({ title, text, time }: { title: string; text: string; time: string }) {
  return (
    <div className="card p-4 flex items-start gap-3">
      <div className="grid place-items-center w-9 h-9 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 shrink-0">
        <Bell className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-sm">{title}</span>
          <span className="text-xs text-slate-400 shrink-0">{time}</span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{text}</p>
      </div>
    </div>
  );
}
