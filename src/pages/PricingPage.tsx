import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Crown, Zap, Star, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LanguageContext';
import { useSiteContent } from '@/context/SiteContentContext';
import PaymentModal from '@/components/PaymentModal';

const PLANS = [
  {
    nameKey: 'pricing.guest',
    price: '$0',
    period: '',
    descKey: 'pricing.guestDesc',
    featuresKey: 'pricing.guestFeatures',
    ctaKey: 'pricing.browseTools',
    to: '/tools',
    highlighted: false,
  },
  {
    nameKey: 'pricing.free',
    price: '$0',
    period: '/month',
    descKey: 'pricing.freeDesc',
    featuresKey: 'pricing.freeFeatures',
    ctaKey: 'pricing.signUpFree',
    to: '/signup',
    highlighted: true,
  },
  {
    nameKey: 'pricing.pro',
    price: '$9',
    period: '/month',
    descKey: 'pricing.proDesc',
    featuresKey: 'pricing.proFeatures',
    ctaKey: 'pricing.upgradeToPro',
    to: '/dashboard',
    highlighted: false,
    pro: true,
  },
];

const PAYMENTS = [
  { name: 'ABA Pay', desc: 'Cambodian mobile banking' },
  { name: 'KHQR', desc: 'Unified QR payments' },
  { name: 'Visa', desc: 'Credit / debit cards' },
  { name: 'MasterCard', desc: 'Credit / debit cards' },
  { name: 'PayPal', desc: 'Global digital wallet' },
  { name: 'Stripe', desc: 'Secure card payments' },
];

export default function PricingPage() {
  const { session, profile } = useAuth();
  const { t } = useLang();
  const { get: c } = useSiteContent();
  const [selected, setSelected] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  return (
    <div className="pt-16 min-h-screen">
      <div className="section py-12">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Crown className="w-4 h-4 text-brand-500" />
            <span>{c('pricing', 'badge', t('pricing.badge'))}</span>
          </div>
          <h1 className="text-4xl font-extrabold">{c('pricing', 'title', t('pricing.title'))}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3">
            {c('pricing', 'subtitle', t('pricing.subtitle'))}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.nameKey}
              className={`rounded-2xl p-6 flex flex-col ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-xl shadow-brand-600/30 scale-105'
                  : plan.pro
                  ? 'glass-strong border-2 border-accent-500/40'
                  : 'glass'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {plan.pro && <Crown className="w-5 h-5 text-accent-500" />}
                <h3 className="text-lg font-bold">{c('pricing', `${plan.nameKey.split('.')[1]}.name`, t(plan.nameKey))}</h3>
                {plan.highlighted && <span className="badge bg-white/20 text-white">{t('pricing.popular')}</span>}
              </div>
              <p className={`text-sm ${plan.highlighted ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                {c('pricing', `${plan.nameKey.split('.')[1]}.desc`, t(plan.descKey))}
              </p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className={`text-sm ${plan.highlighted ? 'text-white/70' : 'text-slate-500'}`}>
                  {plan.period}
                </span>
              </div>
              <ul className="space-y-2 mt-6 flex-1">
                {c('pricing', `${plan.nameKey.split('.')[1]}.features`, t(plan.featuresKey)).split(', ').map((f: string) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlighted ? 'text-white' : 'text-accent-500'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.pro && session && profile?.plan !== 'pro' ? (
                <button
                  onClick={() => setShowPayment(true)}
                  className={`btn w-full mt-6 ${plan.highlighted ? 'bg-white text-brand-700 hover:bg-white/90' : 'btn-accent'}`}
                >
                  {t(plan.ctaKey)}
                </button>
              ) : (
                <Link
                  to={plan.to}
                  className={`btn w-full mt-6 ${
                    plan.highlighted
                      ? 'bg-white text-brand-700 hover:bg-white/90'
                      : plan.pro
                      ? 'btn-accent'
                      : 'btn-outline'
                    }`}
                >
                  {plan.nameKey === 'pricing.pro' && profile?.plan === 'pro' ? t('pricing.currentPlan') : t(plan.ctaKey)}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Payment methods */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold">{t('pricing.payments')}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              {t('pricing.paymentsDesc')}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {PAYMENTS.map((p) => (
              <button
                key={p.name}
                onClick={() => setSelected(selected === p.name ? null : p.name)}
                className={`card p-4 text-center transition ${
                  selected === p.name ? 'ring-2 ring-brand-500' : ''
                }`}
              >
                <div className="font-semibold text-sm">{p.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{p.desc}</div>
              </button>
            ))}
          </div>
          {selected && (
            <div className="text-center mt-6">
              <Link to={session ? '/dashboard' : '/signup'} className="btn-primary">
                {t('pricing.continueWith')} {selected}
              </Link>
              <p className="text-xs text-slate-400 mt-2">
                {t('pricing.demoNote')}
              </p>
            </div>
          )}
        </div>

        {showPayment && (
          <PaymentModal
            open={showPayment}
            onClose={() => setShowPayment(false)}
            itemType="plan"
            itemId={null}
            itemName="Pro Plan — Unlimited AI"
            amount={9}
          />
        )}

        {/* Trust badges */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { icon: Shield, title: t('pricing.trustSecure'), desc: t('pricing.trustSecureDesc') },
            { icon: Zap, title: t('pricing.trustInstant'), desc: t('pricing.trustInstantDesc') },
            { icon: Star, title: t('pricing.trustCancel'), desc: t('pricing.trustCancelDesc') },
          ].map((tr) => (
            <div key={tr.title} className="card p-5 text-center">
              <div className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/15 to-accent-500/15 text-brand-600 dark:text-brand-400 mx-auto mb-3">
                <tr.icon className="w-5 h-5" />
              </div>
              <div className="font-semibold text-sm">{tr.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{tr.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
