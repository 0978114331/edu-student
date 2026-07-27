import { Link } from 'react-router-dom';
import { Star, Heart, Lock } from 'lucide-react';
import type { AITool } from '@/lib/supabase';
import { getToolIcon } from '@/data/catalog';
import { useLang } from '@/context/LanguageContext';

interface ToolCardProps {
  tool: AITool;
  isFavorite: boolean;
  onToggleFavorite?: (toolId: string) => void;
}

export default function ToolCard({ tool, isFavorite, onToggleFavorite }: ToolCardProps) {
  const { t } = useLang();
  const Icon = getToolIcon(tool.icon);
  return (
    <div className="card p-5 flex flex-col gap-3 group">
      <div className="flex items-start justify-between">
        <div className="grid place-items-center w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/15 to-accent-500/15 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2">
          {tool.is_pro ? <span className="badge-pro">{t('common.pro')}</span> : <span className="badge-free">{t('common.free')}</span>}
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(tool.id)}
              className="grid place-items-center w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle favorite"
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                }`}
              />
            </button>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-base">{tool.name}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
          {tool.description}
        </p>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2">
        <div className="flex items-center gap-1 text-sm">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="font-medium">{Number(tool.rating).toFixed(1)}</span>
          <span className="text-slate-400">({tool.reviews_count})</span>
        </div>
        <span className="text-xs text-slate-400">{tool.category}</span>
      </div>

      <Link
        to={`/tools/${tool.slug}`}
        className="btn-outline w-full mt-1"
      >
        {tool.is_pro ? <Lock className="w-4 h-4" /> : null}
        {t('common.openTool')}
      </Link>
    </div>
  );
}
