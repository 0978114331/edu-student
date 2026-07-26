import { useState } from 'react';
import { useNavigate } from '@/lib/router';
import { useAuth } from '@/hooks/use-auth';
import { useI18n } from '@/hooks/use-i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const LOGO_URL = 'https://i.ibb.co/n8sHRYgL/c27be6ea-8cd8-4d42-82c5-7d46549d0957.png';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export function AuthPage({ mode }: { mode: 'signin' | 'signup' }) {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const fn = mode === 'signin' ? signIn : signUp;
    const { error } = await fn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(mode === 'signin' ? 'Signed in successfully.' : 'Account created successfully.');
    navigate('/dashboard');
  };

  const googleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute inset-0 bg-radial-fade" />
      <Card className="relative w-full max-w-md bg-card/80 backdrop-blur-xl">
        <CardHeader className="text-center">
          <img src={LOGO_URL} alt="TEAM EDU" className="mx-auto h-14 w-14 rounded-xl object-cover mb-3" />
          <CardTitle>{mode === 'signin' ? t('auth.welcomeBack') : t('auth.createAccount')}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {mode === 'signin' ? t('auth.signinSubtitle') : t('auth.signupSubtitle')}
          </p>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full gap-2.5 mb-4" onClick={googleSignIn} disabled={googleLoading}>
            {googleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
            {t('auth.signInGoogle')}
          </Button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">{t('auth.or')}</span>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {mode === 'signin' ? t('auth.signIn') : t('auth.signUp')}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            {mode === 'signin' ? t('auth.noAccount') : t('auth.haveAccount')}{' '}
            <button
              onClick={() => navigate(mode === 'signin' ? '/signup' : '/signin')}
              className="text-primary font-medium hover:underline"
            >
              {mode === 'signin' ? t('auth.signUpHere') : t('auth.signInHere')}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
