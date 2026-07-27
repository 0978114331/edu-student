import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Menu, X, Sun, Moon, LayoutDashboard, LogOut, User, Languages, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LanguageContext';

export default function Navbar() {
  const { session, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isAdmin = profile?.role === 'admin';

  const navLinks = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.tools'), to: '/tools' },
    { label: t('nav.resources'), to: '/resources' },
    { label: t('nav.assistant'), to: '/assistant' },
    { label: t('nav.pricing'), to: '/pricing' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-strong shadow-soft' : 'bg-transparent'
      }`}
    >
      <nav className="section flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-lg">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden shadow-lg">
              <img
                src="https://i.ibb.co/n8sHRYgL/c27be6ea-8cd8-4d42-82c5-7d46549d0957.png"
                alt="Offers Education Logo"
                className="w-full h-full object-contain"
              />
            </span>

            <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
              EDU
            </span>
        </Link>

        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="btn-ghost !p-2.5"
            aria-label="Toggle language"
            title={lang === 'en' ? 'ភាសាខ្មែរ' : 'English'}
          >
            <Languages className="w-5 h-5" />
            <span className="text-xs font-bold ml-0.5">{lang === 'en' ? 'EN' : 'Kh'}</span>
          </button>

          <button
            onClick={toggleTheme}
            className="btn-ghost !p-2.5"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {session ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link to="/admin" className="btn-outline !border-accent-500/40 text-accent-600 dark:text-accent-400">
                  <Shield className="w-4 h-4" />
                  {t('nav.admin')}
                </Link>
              )}
              <Link to="/dashboard" className="btn-primary">
                <LayoutDashboard className="w-4 h-4" />
                {t('nav.dashboard')}
              </Link>
              <button onClick={signOut} className="btn-ghost !p-2.5" aria-label={t('nav.signout')}>
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                <User className="w-4 h-4" />
                {t('nav.signin')}
              </Link>
              <Link to="/signup" className="btn-primary">
                {t('nav.signup')}
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="md:hidden btn-ghost !p-2"
          aria-label="Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden glass-strong border-t border-white/10 animate-fade-in">
          <ul className="section py-4 flex flex-col gap-1">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            {session && isAdmin && (
              <li>
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-accent-600 dark:text-accent-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Shield className="w-4 h-4 inline mr-2" />
                  {t('nav.admin')}
                </Link>
              </li>
            )}
            <li className="flex items-center gap-2 pt-2">
              <button onClick={toggleLang} className="btn-outline flex-1">
                <Languages className="w-4 h-4" />
                {lang === 'en' ? 'ខ្មែរ' : 'English'}
              </button>
              <button onClick={toggleTheme} className="btn-outline flex-1">
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                {theme === 'light' ? 'Dark' : 'Light'}
              </button>
            </li>
            <li className="flex items-center gap-2 pt-2">
              {session ? (
                <Link to="/dashboard" onClick={() => setOpen(false)} className="btn-primary flex-1">
                  {t('nav.dashboard')}
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-outline flex-1">
                    {t('nav.signin')}
                  </Link>
                  <Link to="/signup" onClick={() => setOpen(false)} className="btn-primary flex-1">
                    {t('nav.signup')}
                  </Link>
                </>
              )}
            </li>
            {profile?.plan === 'pro' && (
              <li className="badge-pro mt-2 w-fit">Pro Member</li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
