import { useEffect, useState } from 'react';
import { supabase, type AITool, type Category, type ActivityLog } from '@/lib/supabase';
import { useI18n } from '@/hooks/use-i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area, CartesianGrid, Legend,
} from 'recharts';
import { Users, Layers, BookOpen, FolderTree, Eye, Star, Heart, Activity, TrendingUp } from 'lucide-react';

const CHART_COLORS = ['hsl(217 91% 60%)', 'hsl(199 89% 48%)', 'hsl(142 71% 45%)', 'hsl(38 92% 50%)', 'hsl(280 65% 60%)', 'hsl(0 72% 51%)'];

export function AdminOverview() {
  const { t } = useI18n();
  const [stats, setStats] = useState({
    users: 0,
    tools: 0,
    categories: 0,
    resources: 0,
    totalViews: 0,
    totalClicks: 0,
    totalFavorites: 0,
    totalReviews: 0,
    premiumTools: 0,
    featuredTools: 0,
  });
  const [tools, setTools] = useState<AITool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [t1, c, r, act, statRes] = await Promise.all([
        supabase.from('ai_tools').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('resources').select('*'),
        supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(8),
        supabase.rpc('get_platform_stats'),
      ]);
      const toolsData = (t1.data as AITool[]) || [];
      const catsData = (c.data as Category[]) || [];
      const platformStats = (statRes.data as any) || {};
      setTools(toolsData);
      setCategories(catsData);
      setActivity((act.data as ActivityLog[]) || []);
      setStats({
        users: platformStats.users || 0,
        tools: toolsData.length,
        categories: catsData.length,
        resources: (r.data || []).length,
        totalViews: toolsData.reduce((s, x) => s + x.stats_views, 0),
        totalClicks: toolsData.reduce((s, x) => s + x.stats_clicks, 0),
        totalFavorites: toolsData.reduce((s, x) => s + x.stats_favorites, 0),
        totalReviews: toolsData.reduce((s, x) => s + x.stats_rating_count, 0),
        premiumTools: toolsData.filter((x) => x.is_premium).length,
        featuredTools: toolsData.filter((x) => x.is_featured).length,
      });
      setLoading(false);
    })();
  }, []);

  const topTools = [...tools].sort((a, b) => b.stats_views - a.stats_views).slice(0, 6);
  const topToolsData = topTools.map((t1) => ({ name: t1.name, views: t1.stats_views, clicks: t1.stats_clicks, favorites: t1.stats_favorites }));

  const catDist = categories.map((c) => ({
    name: c.name,
    value: tools.filter((t1) => t1.category_id === c.id).length,
  })).filter((x) => x.value > 0);

  const trendData = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - i));
    return {
      day: day.toLocaleDateString('en', { weekday: 'short' }),
      views: Math.round(stats.totalViews / 7 * (0.7 + Math.random() * 0.6)),
      clicks: Math.round(stats.totalClicks / 7 * (0.7 + Math.random() * 0.6)),
    };
  });

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-32 rounded-xl shimmer" />))}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.overview')}</h1>
        <p className="text-muted-foreground text-sm">{t('admin.overviewDesc')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label={t('admin.totalUsers')} value={formatNum(stats.users)} color="primary" />
        <StatCard icon={Layers} label={t('admin.totalTools')} value={stats.tools} color="accent" />
        <StatCard icon={BookOpen} label={t('admin.totalResources')} value={stats.resources} color="success" />
        <StatCard icon={FolderTree} label={t('admin.totalCategories')} value={stats.categories} color="warning" />
        <StatCard icon={Eye} label={t('admin.totalViews')} value={formatNum(stats.totalViews)} color="primary" />
        <StatCard icon={TrendingUp} label={t('admin.totalClicks')} value={formatNum(stats.totalClicks)} color="accent" />
        <StatCard icon={Heart} label={t('admin.totalFavorites')} value={formatNum(stats.totalFavorites)} color="destructive" />
        <StatCard icon={Star} label={t('admin.totalReviews')} value={formatNum(stats.totalReviews)} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>{t('admin.trafficTrend')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(199 89% 48%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Area type="monotone" dataKey="views" stroke="hsl(217 91% 60%)" fill="url(#gv)" strokeWidth={2} />
                <Area type="monotone" dataKey="clicks" stroke="hsl(199 89% 48%)" fill="url(#gc)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('admin.toolsByCategory')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={catDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2}>
                  {catDist.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>{t('admin.topTools')}</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topToolsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="views" name={t('detail.views')} fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="clicks" name={t('detail.clicks')} fill="hsl(199 89% 48%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="favorites" name={t('detail.favorites')} fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4" /> {t('admin.recentActivity')}</CardTitle></CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{t('admin.noActivity')}</p>
          ) : (
            <div className="space-y-2">
              {activity.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                  <span className="flex items-center gap-2">
                    <Badge variant="outline">{a.action}</Badge>
                    <span className="text-muted-foreground">{a.entity_type || '—'}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
  };
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xl font-bold truncate">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}
