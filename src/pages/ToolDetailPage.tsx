import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Heart,
  Lock,
  Zap,
  CheckCircle2,
  Sparkles,
  Send,
  ShoppingCart,
} from 'lucide-react';
import type { AITool, Purchase } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { getToolIcon } from '@/data/catalog';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LanguageContext';
import PaymentModal from '@/components/PaymentModal';

export default function ToolDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const { t } = useLang();
  const [tool, setTool] = useState<AITool | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [usageToday, setUsageToday] = useState(0);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    supabase
      .from('ai_tools')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => {
        setTool(data as AITool | null);
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    if (!session?.user || !tool) return;
    supabase
      .from('favorites')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('tool_id', tool.id)
      .maybeSingle()
      .then(({ data }) => setIsFavorite(!!data));

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    supabase
      .from('usage_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('tool_id', tool.id)
      .gte('created_at', start.toISOString())
      .then(({ count }) => setUsageToday(count ?? 0));

    // Check if user has purchased this tool
    supabase
      .from('purchases')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('item_type', 'tool')
      .eq('item_id', tool.id)
      .eq('status', 'completed')
      .maybeSingle()
      .then(({ data }) => setHasPurchased(!!(data as Purchase | null)));
  }, [session, tool]);

  async function toggleFavorite() {
    if (!session?.user || !tool) return;
    if (isFavorite) {
      setIsFavorite(false);
      await supabase.from('favorites').delete().eq('tool_id', tool.id).eq('user_id', session.user.id);
    } else {
      setIsFavorite(true);
      await supabase.from('favorites').insert({ tool_id: tool.id, user_id: session.user.id });
    }
  }

  async function runTool() {
    if (!tool || !input.trim()) return;
    if (!session?.user) {
      navigate('/login');
      return;
    }
    const isPro = profile?.plan === 'pro';
    if (!isPro && usageToday >= tool.usage_limit_free) {
      setOutput('⚠️ You have reached your daily free limit for this tool. Upgrade to Pro for unlimited usage.');
      return;
    }
    setRunning(true);
    setOutput('');

    await supabase
      .from('usage_logs')
      .insert({ tool_id: tool.id, user_id: session.user.id });
    setUsageToday((u) => u + 1);

    // Simulated AI response (demo — no external API key configured)
    await new Promise((r) => setTimeout(r, 900));
    const responses: Record<string, (t: string) => string> = {
      'ai-writing': (t) => `Here is a draft based on your input:\n\n${t}\n\n[AI-generated content would appear here. Connect an AI provider to enable real generation.]`,
      'ai-translator': (t) => `Translation:\n\n${t}\n\n[Connect a translation API to enable real translation.]`,
      'ai-math-solver': (t) => `Step-by-step solution:\n\n1. Parse the problem: ${t}\n2. Apply relevant formulas\n3. Simplify\n4. Result: [solution]\n\n[Connect a math API for real solutions.]`,
      'ai-chat': (t) => `You asked: "${t}"\n\nHere's what I think: [Connect an AI chat API to enable real responses.]`,
    };
    const fn = responses[tool.slug] ?? ((t: string) => `Processed input: "${t}"\n\n[Connect an AI provider to enable real ${tool.name} output.]`);
    setOutput(fn(input));
    setRunning(false);
  }

  if (loading) {
    return (
      <div className="pt-16 section py-20">
        <div className="card p-8 h-96 animate-pulse" />
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="pt-16 section py-20 text-center">
        <p className="text-slate-500">Tool not found.</p>
        <Link to="/tools" className="btn-primary mt-4">Back to Tools</Link>
      </div>
    );
  }

  const Icon = getToolIcon(tool.icon);
  const isPro = profile?.plan === 'pro';
  const limit = isPro ? Infinity : tool.usage_limit_free;
  const remaining = Math.max(0, limit - usageToday);

  return (
    <div className="pt-16 min-h-screen">
      <div className="section py-10">
        <Link to="/tools" className="btn-ghost !pl-0 mb-6">
          <ArrowLeft className="w-4 h-4" /> {t('tool.backToTools')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: info */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <div className="flex items-start justify-between">
                <div className="grid place-items-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500/15 to-accent-500/15 text-brand-600 dark:text-brand-400">
                  <Icon className="w-7 h-7" />
                </div>
                {session && (
                  <button onClick={toggleFavorite} className="btn-ghost !p-2" aria-label="Favorite">
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                )}
              </div>
              <h1 className="text-2xl font-extrabold mt-4">{tool.name}</h1>
              <div className="flex items-center gap-3 mt-2 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{Number(tool.rating).toFixed(1)}</span>
                  <span className="text-slate-400">({tool.reviews_count})</span>
                </div>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">{tool.category}</span>
              </div>
              <div className="mt-3">
                {tool.is_pro ? <span className="badge-pro"><Lock className="w-3 h-3" /> Pro Tool</span> : <span className="badge-free">Free Tool</span>}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">{tool.description}</p>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 rounded-lg glass">
                  <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-brand-500" /> Daily limit</span>
                  <span className="font-semibold">{isPro ? 'Unlimited' : `${tool.usage_limit_free}/day`}</span>
                </div>
                {session && (
                  <div className="flex items-center justify-between p-3 rounded-lg glass">
                    <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent-500" /> Used today</span>
                    <span className="font-semibold">{usageToday}</span>
                  </div>
                )}
                {session && !isPro && (
                  <div className="p-3 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-brand-700 dark:text-brand-300">Remaining today</span>
                      <span className="font-semibold text-brand-700 dark:text-brand-300">{remaining}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-brand-200 dark:bg-brand-900 overflow-hidden">
                      <div className="h-full bg-brand-600 transition-all" style={{ width: `${(remaining / tool.usage_limit_free) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {!session && (
                <Link to="/signup" className="btn-primary w-full mt-4">
                  {t('tool.signUpToUse')}
                </Link>
              )}
              {session && !isPro && tool.is_pro && !hasPurchased && Number(tool.price) > 0 && (
                <button onClick={() => setShowPayment(true)} className="btn-accent w-full mt-4">
                  <ShoppingCart className="w-4 h-4" /> {t('tool.buyNow')} ${Number(tool.price).toFixed(2)}
                </button>
              )}
              {session && !isPro && tool.is_pro && hasPurchased && (
                <span className="badge-pro w-full justify-center mt-4 !py-2"><CheckCircle2 className="w-4 h-4" /> {t('tool.purchased')}</span>
              )}
              {session && !isPro && tool.is_pro && Number(tool.price) === 0 && !hasPurchased && (
                <Link to="/pricing" className="btn-primary w-full mt-4">
                  <Lock className="w-4 h-4" /> {t('tool.upgradeToPro')}
                </Link>
              )}
            </div>
          </div>

          {/* Right: interactive */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-500" />
                {t('tool.try')} {tool.name}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Enter your input below and run the tool.
              </p>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={5}
                placeholder="Type your input here..."
                className="input resize-none mt-4"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-slate-400">
                  {session ? `${remaining} uses remaining today` : 'Sign in to use'}
                </span>
                <button
                  onClick={runTool}
                  disabled={running || !input.trim()}
                  className="btn-primary"
                >
                  {running ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('tool.running')}
                    </span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> {t('tool.run')}
                    </>
                  )}
                </button>
              </div>

              {output && (
                <div className="mt-6 p-4 rounded-xl glass animate-fade-in">
                  <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-500" />
                    {t('tool.result')}
                  </div>
                  <pre className="text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-200 font-sans">
                    {output}
                  </pre>
                </div>
              )}
            </div>

            {/* Reviews placeholder */}
            <div className="card p-6 mt-6">
              <h3 className="font-semibold mb-3">{t('tool.reviews')}</h3>
              <div className="space-y-3">
                {[
                  { name: 'Sopheap L.', rating: 5, text: 'This tool saved me hours of work!' },
                  { name: 'Dara K.', rating: 4, text: 'Very helpful, would recommend to other students.' },
                ].map((r, i) => (
                  <div key={i} className="p-3 rounded-lg glass">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{r.name}</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={`w-3 h-3 ${j < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPayment && tool && (
        <PaymentModal
          open={showPayment}
          onClose={() => setShowPayment(false)}
          itemType="tool"
          itemId={tool.id}
          itemName={tool.name}
          amount={Number(tool.price)}
          onSuccess={() => setHasPurchased(true)}
        />
      )}
    </div>
  );
}
