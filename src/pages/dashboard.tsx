import { useEffect, useState } from 'react';
import { useNavigate } from '@/lib/router';
import { useAuth } from '@/hooks/use-auth';
import { useI18n } from '@/hooks/use-i18n';
import { supabase, type AITool } from '@/lib/supabase';
import { ToolCard } from '@/components/site/tool-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Clock, BarChart3 } from 'lucide-react';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const [favorites, setFavorites] = useState<AITool[]>([]);
  const [recent, setRecent] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/signin');
      return;
    }
    (async () => {
      const [favRes, recentRes] = await Promise.all([
        supabase.from('favorites').select('*, tool:ai_tools(*, category:categories(*))').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('recently_used').select('*, tool:ai_tools(*, category:categories(*))').eq('user_id', user.id).order('last_accessed_at', { ascending: false }).limit(8),
      ]);
      setFavorites((favRes.data as any[])?.map((f) => f.tool) || []);
      setRecent((recentRes.data as any[])?.map((r) => r.tool) || []);
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return <div className="min-h-screen pt-24" />;
  }

  const displayName = profile?.full_name || user?.email || '';
  const avatarUrl = profile?.avatar_url;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex items-center gap-4">
          <Avatar className="h-14 w-14">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
            <AvatarFallback className="bg-primary/20 text-primary text-lg font-semibold">
              {displayName?.[0]?.toUpperCase() ?? 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground text-sm">{t('dashboard.welcome')}, {displayName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card><CardContent className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-destructive/10 flex items-center justify-center"><Heart className="h-5 w-5 text-destructive" /></div>
            <div><div className="text-2xl font-bold">{favorites.length}</div><div className="text-xs text-muted-foreground">{t('dashboard.favorites')}</div></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center"><Clock className="h-5 w-5 text-primary" /></div>
            <div><div className="text-2xl font-bold">{recent.length}</div><div className="text-xs text-muted-foreground">{t('dashboard.recentlyUsed')}</div></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-accent/10 flex items-center justify-center"><BarChart3 className="h-5 w-5 text-accent" /></div>
            <div><div className="text-2xl font-bold">{recent.reduce((s, t) => s + t.stats_views, 0)}</div><div className="text-xs text-muted-foreground">{t('dashboard.totalViews')}</div></div>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="favorites">
          <TabsList>
            <TabsTrigger value="favorites" className="gap-1.5"><Heart className="h-4 w-4" /> {t('dashboard.favorites')}</TabsTrigger>
            <TabsTrigger value="recent" className="gap-1.5"><Clock className="h-4 w-4" /> {t('dashboard.recentlyUsed')}</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-64 rounded-xl shimmer" />))}
              </div>
            ) : (
              <>
                <div id="favorites" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {favorites.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                      <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">{t('dashboard.noFavorites')}</p>
                      <Button className="mt-4" onClick={() => navigate('/tools')}>{t('dashboard.browseTools')}</Button>
                    </div>
                  ) : (
                    favorites.map((t) => (<ToolCard key={t.id} tool={t} />))
                  )}
                </div>

                <div id="recent" className="hidden grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {recent.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                      <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">{t('dashboard.noRecent')}</p>
                      <Button className="mt-4" onClick={() => navigate('/tools')}>{t('dashboard.browseTools')}</Button>
                    </div>
                  ) : (
                    recent.map((t) => (<ToolCard key={t.id} tool={t} />))
                  )}
                </div>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
