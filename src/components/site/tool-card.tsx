import { useNavigate } from '@/lib/router';
import { type AITool, toolRating } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Star, Eye, ExternalLink, Crown, Sparkles } from 'lucide-react';

export function ToolCard({ tool }: { tool: AITool }) {
  const navigate = useNavigate();
  const rating = toolRating(tool);

  return (
    <button
      onClick={() => navigate(`/tools/${tool.slug}`)}
      className="group relative text-left bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-fade-up"
    >
      <div className="relative h-32 overflow-hidden bg-muted">
        {tool.banner_url ? (
          <img
            src={tool.banner_url}
            alt={tool.name}
            loading="lazy"
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-75 transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
        {tool.is_featured && (
          <Badge className="absolute top-2.5 left-2.5 bg-primary/90 text-primary-foreground border-0 gap-1">
            <Sparkles className="h-3 w-3" /> Featured
          </Badge>
        )}
        {tool.is_premium && (
          <Badge className="absolute top-2.5 right-2.5 bg-warning/90 text-warning-foreground border-0 gap-1">
            <Crown className="h-3 w-3" /> Premium
          </Badge>
        )}
      </div>

      <div className="p-4 -mt-8 relative">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-lg bg-card border border-border overflow-hidden flex-shrink-0 shadow-md">
            {tool.icon_url ? (
              <img src={tool.icon_url} alt={tool.name} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-primary font-bold">
                {tool.name[0]}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-6">
            <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{tool.name}</h3>
            <p className="text-xs text-muted-foreground">{tool.developer_name || 'Unknown'}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-3 line-clamp-2 min-h-[2.5rem]">
          {tool.short_description || 'No description available.'}
        </p>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-warning text-warning" />
                {rating.toFixed(1)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatNum(tool.stats_views)}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Open <ExternalLink className="h-3 w-3" />
          </span>
        </div>
      </div>
    </button>
  );
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}
