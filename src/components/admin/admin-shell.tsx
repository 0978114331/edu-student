import { useState, type ReactNode } from 'react';
import { useNavigate, useRoute } from '@/lib/router';
import { useI18n } from '@/hooks/use-i18n';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  LayoutDashboard, Layers, FolderTree, BookOpen, Key, Settings, Menu, ArrowLeft, ExternalLink, Sun, Moon, Users, ShieldX,
} from 'lucide-react';

const LOGO_URL = 'https://i.ibb.co/n8sHRYgL/c27be6ea-8cd8-4d42-82c5-7d46549d0957.png';

export function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const route = useRoute();
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { user, profile, isAdmin, loading } = useAuth();
  const [open, setOpen] = useState(false);

  const NAV = [
    { label: t('admin.overview'), path: '/admin', icon: LayoutDashboard },
    { label: t('admin.tools'), path: '/admin/tools', icon: Layers },
    { label: t('admin.categories'), path: '/admin/categories', icon: FolderTree },
    { label: t('admin.resources'), path: '/admin/resources', icon: BookOpen },
    { label: t('admin.users'), path: '/admin/users', icon: Users },
    { label: t('admin.providers'), path: '/admin/providers', icon: Key },
    { label: t('admin.settings'), path: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => (path === '/admin' ? route.path === '/admin' : route.path.startsWith(path));

  if (!loading && user && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t('admin.accessDenied')}</h1>
          <p className="text-muted-foreground mb-6">{t('admin.accessDeniedDesc')}</p>
          <Button onClick={() => navigate('/dashboard')}>{t('admin.accessDeniedBack')}</Button>
        </div>
      </div>
    );
  }

  if (!loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <ShieldX className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t('nav.signin')}</h1>
          <p className="text-muted-foreground mb-6">{t('auth.signinSubtitle')}</p>
          <Button onClick={() => navigate('/signin')}>{t('nav.signin')}</Button>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <img src={LOGO_URL} alt="TEAM EDU" className="h-8 w-8 rounded-lg object-cover" />
          <div>
            <div className="font-semibold text-sm">TEAM EDU</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('admin.adminPanel')}</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map((item) => (
          <button
            key={item.path}
            onClick={() => { navigate(item.path); setOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.path) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-border space-y-1">
        <div className="px-3 py-2 text-xs text-muted-foreground">
          {profile?.full_name || profile?.email || user?.email}
          <span className="ml-2 text-[10px] uppercase">{profile?.role}</span>
        </div>
        <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <ExternalLink className="h-4 w-4" /> {t('admin.viewSite')}
        </button>
        <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t('admin.backToApp')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="hidden lg:block w-64 border-r border-border min-h-screen sticky top-0 h-screen bg-card/30">
          <SidebarContent />
        </aside>

        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 h-14 flex items-center justify-between">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Admin navigation</SheetTitle>
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="TEAM EDU" className="h-7 w-7 rounded-lg object-cover" />
            <span className="font-semibold text-sm">{t('admin.adminPanel')}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}><ExternalLink className="h-4 w-4" /></Button>
        </div>

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
