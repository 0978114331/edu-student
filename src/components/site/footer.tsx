import { useNavigate } from '@/lib/router';
import { useI18n } from '@/hooks/use-i18n';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const LOGO_URL = 'https://i.ibb.co/n8sHRYgL/c27be6ea-8cd8-4d42-82c5-7d46549d0957.png';

export function Footer() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const cols = [
    {
      title: t('nav.tools'),
      links: [
        { label: t('nav.tools'), path: '/tools' },
        { label: t('nav.resources'), path: '/resources' },
        { label: t('nav.categories'), path: '/categories' },
        { label: t('nav.pricing'), path: '/pricing' },
      ],
    },
    {
      title: t('nav.dashboard'),
      links: [
        { label: t('nav.signin'), path: '/signin' },
        { label: t('nav.getStarted'), path: '/signup' },
        { label: t('nav.dashboard'), path: '/dashboard' },
        { label: t('nav.admin'), path: '/admin' },
      ],
    },
    {
      title: 'TEAM EDU',
      links: [
        { label: 'About', path: '/' },
        { label: 'Contact', path: '/' },
        { label: 'Privacy', path: '/' },
        { label: 'Terms', path: '/' },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-card/30">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <button onClick={() => navigate('/')} className="flex items-center gap-2.5 mb-4">
              <img src={LOGO_URL} alt="TEAM EDU" className="h-9 w-9 rounded-lg object-cover" />
              <div className="flex flex-col items-start leading-none">
                <span className="font-bold text-lg">TEAM EDU</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">AI Platform</span>
              </div>
            </button>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t('hero.subtitle')}
            </p>
            <div className="flex items-center gap-3 mt-4">
              {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                <button key={i} className="h-9 w-9 rounded-md bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-sm mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <button
                      onClick={() => navigate(l.path)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© 2026 TEAM EDU. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Built with React, Supabase & AI.</p>
        </div>
      </div>
    </footer>
  );
}
