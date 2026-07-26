import { useEffect, useState } from 'react';
import { useNavigate } from '@/lib/router';
import { useAuth } from '@/hooks/use-auth';
import { useI18n } from '@/hooks/use-i18n';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { GraduationCap, Menu, Search, LayoutDashboard, LogOut, User as UserIcon, Heart, Bookmark, Sun, Moon, Languages } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const LOGO_URL = 'https://i.ibb.co/n8sHRYgL/c27be6ea-8cd8-4d42-82c5-7d46549d0957.png';

export function Navbar() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { t, lang, setLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links: { label: string; path: string }[] = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.tools'), path: '/tools' },
    { label: t('nav.resources'), path: '/resources' },
    { label: t('nav.categories'), path: '/categories' },
    { label: t('nav.pricing'), path: '/pricing' },
  ];

  const go = (p: string) => {
    setOpen(false);
    navigate(p);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-border' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <button onClick={() => go('/')} className="flex items-center gap-2.5 group">
            <img src={LOGO_URL} alt="TEAM EDU" className="h-9 w-9 rounded-lg object-cover" />
            <div className="flex flex-col items-start leading-none">
              <span className="font-bold text-lg tracking-tight">TEAM EDU</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">AI Platform</span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <button
                key={l.path}
                onClick={() => go(l.path)}
                className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" onClick={() => go('/tools')} aria-label="Search" className="hidden sm:flex">
              <Search className="h-4 w-4" />
            </Button>

            {/* Language toggle */}
            <Button variant="ghost" size="sm" onClick={() => setLang(lang === 'en' ? 'kh' : 'en')} className="gap-1.5 px-2.5">
              <Languages className="h-4 w-4" />
              <span className="text-xs font-semibold">{lang === 'en' ? 'EN' : 'ខ្មែរ'}</span>
            </Button>

            {/* Theme toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden md:flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-muted/50 transition-colors">
                    <Avatar className="h-7 w-7">
                      {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt={profile?.full_name || user.email || ''} /> : null}
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                        {(profile?.full_name || user.email)?.[0]?.toUpperCase() ?? 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium max-w-[120px] truncate">{profile?.full_name || user.email}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => go('/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" /> {t('nav.dashboard')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => go('/dashboard?tab=favorites')}>
                    <Heart className="mr-2 h-4 w-4" /> {t('nav.favorites')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => go('/dashboard?tab=recent')}>
                    <Bookmark className="mr-2 h-4 w-4" /> {t('nav.recent')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => go('/admin')}>
                    <UserIcon className="mr-2 h-4 w-4" /> {t('nav.admin')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" /> {t('nav.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" onClick={() => go('/signin')}>
                  {t('nav.signin')}
                </Button>
                <Button onClick={() => go('/signup')}>{t('nav.getStarted')}</Button>
              </div>
            )}

            <div className="md:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <div className="flex flex-col gap-1 mt-6">
                    {links.map((l) => (
                      <button
                        key={l.path}
                        onClick={() => go(l.path)}
                        className="text-left px-3 py-2.5 text-sm font-medium rounded-md hover:bg-muted/50 transition-colors"
                      >
                        {l.label}
                      </button>
                    ))}
                    <div className="h-px bg-border my-3" />
                    {user ? (
                      <>
                        <button onClick={() => go('/dashboard')} className="text-left px-3 py-2.5 text-sm rounded-md hover:bg-muted/50">
                          {t('nav.dashboard')}
                        </button>
                        <button onClick={() => go('/admin')} className="text-left px-3 py-2.5 text-sm rounded-md hover:bg-muted/50">
                          {t('nav.admin')}
                        </button>
                        <button onClick={() => signOut()} className="text-left px-3 py-2.5 text-sm rounded-md hover:bg-muted/50 text-destructive">
                          {t('nav.signOut')}
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => go('/signin')} className="text-left px-3 py-2.5 text-sm rounded-md hover:bg-muted/50">
                          {t('nav.signin')}
                        </button>
                        <button onClick={() => go('/signup')} className="text-left px-3 py-2.5 text-sm rounded-md hover:bg-muted/50 text-primary">
                          {t('nav.getStarted')}
                        </button>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
