import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Mail, Lock, User, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LanguageContext';

interface AuthShellProps {
  mode: 'login' | 'signup';
}

export default function AuthPage({ mode }: AuthShellProps) {
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const isSignup = mode === 'signup';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const result = isSignup
      ? await signUp(email, password, fullName)
      : await signIn(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      navigate('/dashboard');
    }
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    const result = await signInWithGoogle();
    setGoogleLoading(false);
    if (result.error) {
      setError(result.error);
    }
    // On success, Supabase redirects to Google OAuth → back to /dashboard
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setInfo(t('auth.resetSent'));
    }
  }

  return (
    <div className="pt-16 min-h-screen flex items-center">
      <div className="section py-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
        {/* Left: brand panel */}
        <div className="hidden lg:block">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl mb-6">
            <img
              src="https://i.ibb.co/n8sHRYgL/c27be6ea-8cd8-4d42-82c5-7d46549d0957.png"
              alt="EDU Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
              EDU
            </span>
          </Link>
          <h2 className="text-3xl font-extrabold leading-tight">
            {isSignup ? t('auth.signup.welcome') : t('auth.login.welcome')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3">
            {isSignup
              ? t('hero.subtitle')
              : t('auth.login.subtitle')}
          </p>
          <ul className="mt-6 space-y-3">
            {[t('stats.tools'), t('feature.resources.title'), t('dashboard.title'), t('feature.secure.title')].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-accent-500" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: form */}
        <div className="card p-8">
          <div className="lg:hidden flex items-center gap-2 font-extrabold text-xl mb-6">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
              <Brain className="w-5 h-5" />
            </span>
            <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">EDU</span>
          </div>

          {showReset ? (
            <>
              <h1 className="text-2xl font-extrabold">{t('auth.resetPassword')}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t('auth.forgotPassword')}
              </p>
              <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                <Field icon={Mail} label={t('auth.email')}>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input !pl-11"
                    placeholder={t('contact.emailPlaceholder')}
                  />
                </Field>
                {error && (
                  <div className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-lg p-3">{error}</div>
                )}
                {info && (
                  <div className="text-sm text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-950/40 rounded-lg p-3">{info}</div>
                )}
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('auth.resetPassword')}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowReset(false); setInfo(null); setError(null); }}
                  className="btn-ghost w-full"
                >
                  {t('common.cancel')}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold">
                {isSignup ? t('auth.signup.title') : t('auth.login.title')}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isSignup ? t('auth.signup.subtitle') : t('auth.login.subtitle')}
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {isSignup && (
                  <Field icon={User} label={t('auth.fullName')}>
                    <input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input !pl-11"
                      placeholder={t('contact.namePlaceholder')}
                    />
                  </Field>
                )}
                <Field icon={Mail} label={t('auth.email')}>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input !pl-11"
                    placeholder={t('contact.emailPlaceholder')}
                  />
                </Field>
                <Field icon={Lock} label={t('auth.password')}>
                  <input
                    required
                    type="password"
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input !pl-11"
                    placeholder="••••••••"
                  />
                </Field>

                {!isSignup && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowReset(true)}
                      className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      {t('auth.forgotPassword')}
                    </button>
                  </div>
                )}

                {error && (
                  <div className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-lg p-3">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('common.loading')}
                    </span>
                  ) : (
                    <>
                      {isSignup ? t('auth.createAccount') : t('auth.signIn')} <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative text-center">
                  <span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400">{t('auth.orContinue')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="btn-outline w-full"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                {t('auth.google')}
              </button>

              <p className="text-center text-sm mt-6 text-slate-500 dark:text-slate-400">
                {isSignup ? t('auth.noAccount') : t('auth.haveAccount')}{' '}
                <Link to={isSignup ? '/login' : '/signup'} className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                  {isSignup ? t('auth.signIn') : t('auth.signup.title')}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        {children}
      </div>
    </div>
  );
}
