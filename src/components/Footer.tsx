import { Link } from 'react-router-dom';
import { Brain, Github, Twitter, Facebook, Youtube, Mail } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

const SOCIALS = [
  { icon: Github, href: 'https://github.com/', label: 'GitHub' },
  { icon: Twitter, href: 'https://twitter.com/edu_platform', label: 'Twitter' },
  { icon: Facebook, href: 'https://www.facebook.com/Chvea', label: 'Facebook' },
  { icon: Youtube, href: 'https://www.youtube.com/@khouvchvea', label: 'YouTube' },
  { icon: Mail, href: 'mailto:Khouvchvea123@gmail.com', label: 'Email' },
];

export default function Footer() {
  const { t } = useLang();

  const footerLinks = [
    {
      title: t('footer.platform'),
      links: [
        { label: t('nav.tools'), to: '/tools' },
        { label: t('nav.resources'), to: '/resources' },
        { label: t('nav.pricing'), to: '/pricing' },
        { label: t('nav.assistant'), to: '/assistant' },
      ],
    },
    {
      title: t('footer.account'),
      links: [
        { label: t('nav.signin'), to: '/login' },
        { label: t('nav.signup'), to: '/signup' },
        { label: t('nav.dashboard'), to: '/dashboard' },
      ],
    },
    {
      title: t('footer.company'),
      links: [
        { label: t('nav.home'), to: '/' },
        { label: t('section.contact'), to: '/#contact' },
        { label: t('section.faq'), to: '/#faq' },
      ],
    },
  ];

  return (
    <footer className="mt-24 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50">
      <div className="section py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
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
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-2 mt-4">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target={s.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={s.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                  className="grid place-items-center w-9 h-9 rounded-lg glass hover:text-brand-600 dark:hover:text-brand-400 hover:scale-110 transition"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-sm mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} EDU. {t('footer.rights')}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('footer.built')}
          </p>
        </div>
      </div>
    </footer>
  );
}
