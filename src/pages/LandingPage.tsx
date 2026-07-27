import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Brain,
  GraduationCap,
  Zap,
  Shield,
  Globe,
  Star,
  ChevronDown,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import FeaturedSection from '@/components/FeaturedSection';
import { TESTIMONIALS as FALLBACK_TESTIMONIALS, TOOL_CATEGORIES } from '@/data/catalog';
import { supabase, type Testimonial, type SiteStats } from '@/lib/supabase';
import { useLang } from '@/context/LanguageContext';
import { useSiteContent } from '@/context/SiteContentContext';

const PAYMENTS = ['ABA Pay', 'KHQR', 'Visa', 'MasterCard', 'PayPal', 'Stripe'];

const FEATURES = [
  { key: 'aiLearning', icon: Brain, to: '/tools' },
  { key: 'resources', icon: GraduationCap, to: '/resources' },
  { key: 'fast', icon: Zap, to: '/assistant' },
  { key: 'secure', icon: Shield, to: '/pricing' },
  { key: 'multilang', icon: Globe, to: '/signup' },
  { key: 'pro', icon: Sparkles, to: '/pricing' },
] as const;

export default function LandingPage() {
  const { t } = useLang();
  const { get: c } = useSiteContent();
  const [query, setQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(FALLBACK_TESTIMONIALS as unknown as Testimonial[]);
  const [stats, setStats] = useState<SiteStats>({ tools: 16, resources: 8, students: 0, purchases: 0, revenue: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) setTestimonials(data as Testimonial[]);
      });

    supabase
      .rpc('get_site_stats')
      .then(({ data }) => {
        if (data) setStats(data as SiteStats);
      });
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/tools?q=${encodeURIComponent(query)}`);
  }

  function handleContact(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    setContactForm({ name: '', email: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  }

  const faqs = [
    { q: c('faq', 'q1', t('faq.q1')), a: c('faq', 'a1', t('faq.a1')) },
    { q: c('faq', 'q2', t('faq.q2')), a: c('faq', 'a2', t('faq.a2')) },
    { q: c('faq', 'q3', t('faq.q3')), a: c('faq', 'a3', t('faq.a3')) },
    { q: c('faq', 'q4', t('faq.q4')), a: c('faq', 'a4', t('faq.a4')) },
    { q: c('faq', 'q5', t('faq.q5')), a: c('faq', 'a5', t('faq.a5')) },
    { q: c('faq', 'q6', t('faq.q6')), a: c('faq', 'a6', t('faq.a6')) },
  ];

  const statItems = [
    { label: c('stats', 'tools', t('stats.tools')), value: `${stats.tools}+` },
    { label: c('stats', 'resources', t('stats.resources')), value: stats.resources >= 1000 ? `${(stats.resources / 1000).toFixed(1)}k` : `${stats.resources}` },
    { label: c('stats', 'students', t('stats.students')), value: stats.students >= 1000 ? `${(stats.students / 1000).toFixed(0)}k` : `${stats.students}` },
    { label: c('stats', 'countries', t('stats.countries')), value: '30+' },
  ];

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="section py-20 lg:py-28 text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>{c('hero', 'badge', t('hero.badge'))}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto animate-fade-in-up">
            {c('hero', 'title', t('hero.title'))}{' '}
            <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
              {c('hero', 'title.highlight', t('hero.title.highlight'))}
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {c('hero', 'subtitle', t('hero.subtitle'))}
          </p>

          <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={c('hero', 'search.placeholder', t('hero.search.placeholder'))}
                className="input !pl-12 !pr-32 !py-3.5 text-base"
              />
              <button type="submit" className="btn-primary absolute right-2 top-1/2 -translate-y-1/2">
                {c('hero', 'search.button', t('hero.search.button'))}
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {TOOL_CATEGORIES.slice(0, 6).map((c) => (
              <Link
                key={c}
                to={`/tools?category=${encodeURIComponent(c)}`}
                className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-100 dark:hover:bg-brand-900/40 hover:text-brand-700 dark:hover:text-brand-300 transition"
              >
                {c}
              </Link>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {statItems.map((s) => (
              <Link
                key={s.label}
                to="/tools"
                className="group p-4 rounded-xl hover:bg-white/50 dark:hover:bg-slate-900/50 transition"
              >
                <div className="text-3xl font-extrabold bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  {s.value}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FeaturedSection />

      {/* Categories */}
      <section className="section py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold">{t('section.categories')}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{t('section.categories.desc')}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {TOOL_CATEGORIES.map((c, i) => (
            <Link
              key={c}
              to={`/tools?category=${encodeURIComponent(c)}`}
              className="card p-5 text-center hover:border-brand-500/40"
            >
              <div className="text-3xl font-extrabold text-brand-500/30">0{i + 1}</div>
              <div className="font-semibold mt-1">{c}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold">{c('features', 'title', t('section.features'))}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{c('features', 'desc', t('section.features.desc'))}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <Link key={f.key} to={f.to} className="card p-6 group">
              <div className="grid place-items-center w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/15 to-accent-500/15 text-brand-600 dark:text-brand-400 mb-4 group-hover:scale-110 transition-transform">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">{c('features', `${f.key}.title`, t(`feature.${f.key}.title`))}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{c('features', `${f.key}.desc`, t(`feature.${f.key}.desc`))}</p>
              <div className="flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 mt-3 font-semibold group-hover:gap-2 transition-all">
                {t(`feature.${f.key}.cta`)}
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="section py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold">{t('section.testimonials')}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{t('section.testimonials.desc')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((tm) => (
            <div key={tm.id} className="card p-6">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < tm.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                ))}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">"{tm.text}"</p>
              <div className="flex items-center gap-3 mt-4">
                {tm.avatar_url && (
                  <img src={tm.avatar_url} alt={tm.name} className="w-10 h-10 rounded-full object-cover" />
                )}
                <div>
                  <div className="font-semibold text-sm">{tm.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{tm.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="section py-16">
        <div className="glass-strong rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-extrabold">{t('pricing.badge')}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">
              {t('pricing.subtitle')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-8">
              <PlanCard name={t('pricing.guest')} price="$0" features={t('pricing.guestFeatures').split(', ')} />
              <PlanCard name={t('pricing.free')} price="$0" features={t('pricing.freeFeatures').split(', ')} highlighted />
              <PlanCard name={t('pricing.pro')} price="$9/mo" features={t('pricing.proFeatures').split(', ')} />
            </div>
            <Link to="/pricing" className="btn-primary mt-8">
              {t('section.features')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold">{t('section.faq')}</h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((item, i) => (
            <div key={i} className="card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-semibold">{item.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-sm text-slate-500 dark:text-slate-400 animate-fade-in">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="section py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h2 className="text-3xl font-extrabold">{c('contact', 'title', t('section.contact'))}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">{c('contact', 'desc', t('section.contact.desc'))}</p>
            <div className="space-y-4 mt-8">
              <a href={`mailto:${c('contact', 'email', t('contact.info.emailValue'))}`} className="flex items-center gap-3 group">
                <div className="grid place-items-center w-10 h-10 rounded-lg glass text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium">{t('contact.info.email')}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">{c('contact', 'email', t('contact.info.emailValue'))}</div>
                </div>
              </a>
              <a href={`tel:${c('contact', 'phone', t('contact.info.phoneValue')).replace(/\s/g, '')}`} className="flex items-center gap-3 group">
                <div className="grid place-items-center w-10 h-10 rounded-lg glass text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium">{t('contact.info.phone')}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">{c('contact', 'phone', t('contact.info.phoneValue'))}</div>
                </div>
              </a>
              <a href="https://maps.app.goo.gl/tfqKcsGUQm9jWZ7W9"target="_blank"rel="noopener noreferrer"className="flex items-center gap-3 group">                
                <div className="grid place-items-center w-10 h-10 rounded-lg glass text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium">{t('contact.info.address')}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">{c('contact', 'address', t('contact.info.addressValue'))}</div>
                </div>
              </a>
            </div>
            <div className="mt-6">
              <div className="text-sm font-medium mb-2">{t('contact.payments')}</div>
              <div className="flex flex-wrap gap-2">
                {PAYMENTS.map((p) => (
                  <span key={p} className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleContact} className="card p-6 space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">{t('contact.name')}</label>
              <input
                required
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="input"
                placeholder={t('contact.namePlaceholder')}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">{t('contact.email')}</label>
              <input
                required
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="input"
                placeholder={t('contact.emailPlaceholder')}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">{t('contact.message')}</label>
              <textarea
                required
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                rows={4}
                className="input resize-none"
                placeholder={t('contact.messagePlaceholder')}
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              {sent ? <CheckCircle2 className="w-4 h-4" /> : null}
              {sent ? t('contact.sent') : t('contact.send')}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function PlanCard({
  name,
  price,
  features,
  highlighted,
}: {
  name: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-6 text-left ${
        highlighted
          ? 'bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-xl shadow-brand-600/30'
          : 'glass'
      }`}
    >
      <div className="text-sm font-semibold opacity-80">{name}</div>
      <div className="text-3xl font-extrabold mt-1">{price}</div>
      <ul className="space-y-2 mt-4">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
