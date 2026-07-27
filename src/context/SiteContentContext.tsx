import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, type SiteContentRow } from '@/lib/supabase';
import { useLang } from '@/context/LanguageContext';

type ContentMap = Record<string, SiteContentRow>;

interface SiteContentContextValue {
  content: ContentMap;
  loading: boolean;
  refresh: () => void;
  /** Get a content value by section.key, e.g. "hero.title" */
  get: (section: string, key: string, fallback?: string) => string;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const { lang } = useLang();
  const [content, setContent] = useState<ContentMap>({});
  const [loading, setLoading] = useState(true);

  function load() {
    supabase
      .from('site_content')
      .select('*')
      .then(({ data }) => {
        if (data) {
          const map: ContentMap = {};
          for (const row of data as SiteContentRow[]) {
            map[`${row.section}.${row.key}`] = row;
          }
          setContent(map);
        }
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
  }, []);

  function get(section: string, key: string, fallback?: string): string {
    const row = content[`${section}.${key}`];
    if (!row) return fallback ?? '';
    return lang === 'km' ? (row.value_km || row.value_en || fallback || '') : (row.value_en || row.value_km || fallback || '');
  }

  return (
    <SiteContentContext.Provider value={{ content, loading, refresh: load, get }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error('useSiteContent must be used within SiteContentProvider');
  return ctx;
}
