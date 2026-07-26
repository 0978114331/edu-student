import { useEffect, useState } from 'react';
import { useNavigate } from '@/lib/router';
import { supabase, type AITool, type Category, type Review, toolRating } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { ToolCard } from '@/components/site/tool-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Star,
  Eye,
  Heart,
  Share2,
  ExternalLink,
  BookOpen,
  Github,
  Code2,
  Crown,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export function ToolDetailPage({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tool, setTool] = useState<AITool | null>(null);
  const [related, setRelated] = useState<AITool[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('ai_tools')
        .select('*, category:categories(*)')
        .eq('slug', slug)
        .maybeSingle();
      if (!data) {
        setLoading(false);
        return;
      }
      const t = data as AITool;
      setTool(t);
      await supabase.rpc('increment_tool_stat', { p_tool_id: t.id, p_stat: 'views' });

      if (t.category_id) {
        const { data: rel } = await supabase
          .from('ai_tools')
          .select('*, category:categories(*)')
          .eq('is_published', true)
          .eq('category_id', t.category_id)
          .neq('id', t.id)
          .limit(4);
        setRelated((rel as AITool[]) || []);
      }

      const { data: revs } = await supabase
        .from('reviews')
        .select('*')
        .eq('tool_id', t.id)
        .order('created_at', { ascending: false });
      setReviews((revs as Review[]) || []);

      if (user) {
        const { data: fav } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('tool_id', t.id)
          .maybeSingle();
        setIsFavorite(!!fav);
      }
      setLoading(false);
    })();
  }, [slug, user]);

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Please sign in to favorite tools.');
      navigate('/signin');
      return;
    }
    if (!tool) return;
    setFavLoading(true);
    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('tool_id', tool.id);
      await supabase.rpc('increment_tool_stat', { p_tool_id: tool.id, p_stat: 'favorites_dec' });
      setIsFavorite(false);
      toast.success('Removed from favorites.');
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, tool_id: tool.id });
      await supabase.rpc('increment_tool_stat', { p_tool_id: tool.id, p_stat: 'favorites' });
      setIsFavorite(true);
      toast.success('Added to favorites.');
    }
    setFavLoading(false);
  };

  const openTool = async () => {
    if (!tool) return;
    await supabase.rpc('increment_tool_stat', { p_tool_id: tool.id, p_stat: 'clicks' });
    if (user) {
      const { data: existing } = await supabase
        .from('recently_used')
        .select('id, usage_count')
        .eq('user_id', user.id)
        .eq('tool_id', tool.id)
        .maybeSingle();
      if (existing) {
        await supabase
          .from('recently_used')
          .update({ usage_count: (existing as any).usage_count + 1, last_accessed_at: new Date().toISOString() })
          .eq('id', (existing as any).id);
      } else {
        await supabase.from('recently_used').insert({ user_id: user.id, tool_id: tool.id });
      }
    }
    if (tool.website_url) window.open(tool.website_url, '_blank', 'noopener,noreferrer');
  };

  const share = async () => {
    if (!tool) return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: tool.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard.');
      }
      await supabase.rpc('increment_tool_stat', { p_tool_id: tool.id, p_stat: 'shares' });
    } catch {}
  };

  const submitReview = async () => {
    if (!user) {
      toast.error('Please sign in to leave a review.');
      navigate('/signin');
      return;
    }
    if (!tool) return;
    setSubmittingReview(true);
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('tool_id', tool.id)
      .eq('user_id', user.id)
      .maybeSingle();
    if (existing) {
      await supabase
        .from('reviews')
        .update({ rating: newRating, comment: newComment })
        .eq('id', (existing as any).id);
      toast.success('Review updated.');
    } else {
      await supabase.from('reviews').insert({ tool_id: tool.id, user_id: user.id, rating: newRating, comment: newComment });
      await supabase
        .from('ai_tools')
        .update({
          stats_rating_sum: tool.stats_rating_sum + newRating,
          stats_rating_count: tool.stats_rating_count + 1,
        })
        .eq('id', tool.id);
      toast.success('Review submitted.');
    }
    setNewComment('');
    const { data: revs } = await supabase.from('reviews').select('*').eq('tool_id', tool.id).order('created_at', { ascending: false });
    setReviews((revs as Review[]) || []);
    setSubmittingReview(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="h-64 rounded-xl shimmer" />
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Tool not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/tools')}>
            Back to Tools
          </Button>
        </div>
      </div>
    );
  }

  const rating = toolRating(tool);

  return (
    <div className="min-h-screen pt-20 pb-20">
      {/* Banner */}
      <div className="relative h-56 sm:h-72 overflow-hidden">
        {tool.banner_url ? (
          <img src={tool.banner_url} alt={tool.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
      </div>

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 -mt-20 relative">
        <Button variant="ghost" size="sm" onClick={() => navigate('/tools')} className="mb-4 gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Tools
        </Button>

        {/* Header card */}
        <Card className="bg-card/80 backdrop-blur-xl border-border">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="h-20 w-20 rounded-xl bg-card border border-border overflow-hidden flex-shrink-0 shadow-lg">
                {tool.icon_url ? (
                  <img src={tool.icon_url} alt={tool.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-2xl font-bold text-primary">
                    {tool.name[0]}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold">{tool.name}</h1>
                  {tool.is_featured && (
                    <Badge className="gap-1"><Sparkles className="h-3 w-3" /> Featured</Badge>
                  )}
                  {tool.is_premium && (
                    <Badge className="bg-warning/90 text-warning-foreground gap-1"><Crown className="h-3 w-3" /> Premium</Badge>
                  )}
                  {tool.is_popular && (
                    <Badge variant="secondary" className="gap-1"><TrendingUp className="h-3 w-3" /> Popular</Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{tool.short_description}</p>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                  {rating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      {rating.toFixed(1)} ({tool.stats_rating_count})
                    </span>
                  )}
                  <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {formatNum(tool.stats_views)}</span>
                  <span className="flex items-center gap-1"><Heart className="h-4 w-4" /> {formatNum(tool.stats_favorites)}</span>
                  {tool.developer_name && <span>by {tool.developer_name}</span>}
                  {tool.version && <span>v{tool.version}</span>}
                  <Badge variant="outline" className="capitalize">{tool.pricing_type}</Badge>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:w-40">
                <Button onClick={openTool} className="gap-2 w-full">
                  <ExternalLink className="h-4 w-4" /> Open Tool
                </Button>
                <Button variant={favLoading ? 'secondary' : 'outline'} onClick={toggleFavorite} className="gap-2 w-full">
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-destructive text-destructive' : ''}`} />
                  {isFavorite ? 'Favorited' : 'Favorite'}
                </Button>
                <Button variant="outline" onClick={share} className="gap-2 w-full">
                  <Share2 className="h-4 w-4" /> Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        {tool.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tool.tags.map((tag) => (
              <Badge key={tag} variant="secondary">#{tag}</Badge>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About {tool.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {tool.full_description || tool.short_description || 'No description available.'}
                </p>
              </CardContent>
            </Card>

            {/* Links */}
            <Card>
              <CardHeader>
                <CardTitle>Links & Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {tool.website_url && (
                  <LinkRow icon={ExternalLink} label="Official Website" url={tool.website_url} />
                )}
                {tool.documentation_url && (
                  <LinkRow icon={BookOpen} label="Documentation" url={tool.documentation_url} />
                )}
                {tool.github_url && <LinkRow icon={Github} label="GitHub Repository" url={tool.github_url} />}
                {tool.demo_url && <LinkRow icon={Code2} label="Demo" url={tool.demo_url} />}
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews ({reviews.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user && (
                  <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Your rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button key={n} onClick={() => setNewRating(n)}>
                            <Star className={`h-5 w-5 ${n <= newRating ? 'fill-warning text-warning' : 'text-muted-foreground'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your experience..."
                      rows={3}
                    />
                    <Button size="sm" onClick={submitReview} disabled={submittingReview}>
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </div>
                )}
                {reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No reviews yet. Be the first to review!</p>
                ) : (
                  reviews.map((r) => (
                    <div key={r.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-warning text-warning' : 'text-muted-foreground'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <StatRow icon={Eye} label="Views" value={formatNum(tool.stats_views)} />
                <StatRow icon={ExternalLink} label="Clicks" value={formatNum(tool.stats_clicks)} />
                <StatRow icon={Heart} label="Favorites" value={formatNum(tool.stats_favorites)} />
                <StatRow icon={Share2} label="Shares" value={formatNum(tool.stats_shares)} />
                <StatRow icon={Star} label="Avg Rating" value={rating > 0 ? rating.toFixed(1) : '—'} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {tool.category && <DetailRow label="Category" value={tool.category.name} />}
                <DetailRow label="Developer" value={tool.developer_name || '—'} />
                <DetailRow label="Version" value={tool.version || '—'} />
                <DetailRow label="Language" value={tool.language} />
                <DetailRow label="Pricing" value={tool.pricing_type} />
                <DetailRow label="Status" value={tool.status} />
                <DetailRow label="Added" value={new Date(tool.created_at).toLocaleDateString()} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">Related Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((t) => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LinkRow({ icon: Icon, label, url }: { icon: any; label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors group"
    >
      <span className="flex items-center gap-2.5 text-sm">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </span>
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
    </a>
  );
}

function StatRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </span>
      <span className="font-semibold text-sm">{value}</span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}
