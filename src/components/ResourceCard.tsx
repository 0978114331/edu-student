import { Link } from 'react-router-dom';
import { Star, Lock, Download, Play, BookOpen } from 'lucide-react';
import type { Resource } from '@/lib/supabase';
import { useLang } from '@/context/LanguageContext';

const TYPE_ICON: Record<string, typeof BookOpen> = {
  course: BookOpen,
  ebook: BookOpen,
  document: BookOpen,
  video: Play,
  tutorial: Play,
  exercise: Download,
};

export default function ResourceCard({ resource }: { resource: Resource }) {
  const { t } = useLang();
  const Icon = TYPE_ICON[resource.type] ?? BookOpen;
  return (
    <Link to={`/resources/${resource.id}`} className="card overflow-hidden flex flex-col group cursor-pointer hover:shadow-lg transition-shadow">
      <div className="relative h-40 overflow-hidden">
        {resource.image_url ? (
          <img
            src={resource.image_url}
            alt={resource.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
        <div className="absolute top-3 right-3 glass rounded-lg px-2 py-1 text-xs font-medium capitalize flex items-center gap-1">
          <Icon className="w-3 h-3" />
          {resource.type}
        </div>
      </div>
      <div className="p-5 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-base line-clamp-1">{resource.name}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
          {resource.description}
        </p>
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-medium">{Number(resource.rating).toFixed(1)}</span>
          </div>
          <span className="text-xs text-slate-400">{resource.category}</span>
        </div>
      </div>
    </Link>
  );
}
