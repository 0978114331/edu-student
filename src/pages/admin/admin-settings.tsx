import { useEffect, useState } from 'react';
import { supabase, type Settings } from '@/lib/supabase';
import { useI18n } from '@/hooks/use-i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

export function AdminSettings() {
  const { t } = useI18n();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('settings').select('*').limit(1).maybeSingle();
      setSettings(data as Settings);
      setLoading(false);
    })();
  }, []);

  const update = (patch: Partial<Settings>) => setSettings((s) => (s ? { ...s, ...patch } : s));

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase.from('settings').update({
      site_name: settings.site_name,
      tagline: settings.tagline,
      logo_url: settings.logo_url,
      favicon_url: settings.favicon_url,
      primary_color: settings.primary_color,
      default_theme: settings.default_theme,
      homepage_banner_url: settings.homepage_banner_url,
      seo_title: settings.seo_title,
      seo_description: settings.seo_description,
      google_analytics_id: settings.google_analytics_id,
      smtp_host: settings.smtp_host,
      telegram_bot_token: settings.telegram_bot_token,
      maintenance_mode: settings.maintenance_mode,
      default_language: settings.default_language,
      timezone: settings.timezone,
    }).eq('id', settings.id);
    if (error) toast.error(error.message); else toast.success('OK');
    setSaving(false);
  };

  if (loading || !settings) return <div className="h-64 rounded-xl shimmer" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.settings')}</h1>
          <p className="text-muted-foreground text-sm">{t('admin.settingsDesc')}</p>
        </div>
        <Button onClick={save} disabled={saving} className="gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{t('admin.save')}</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>{t('admin.branding')}</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>{t('admin.siteName')}</Label><Input value={settings.site_name} onChange={(e) => update({ site_name: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>{t('admin.tagline')}</Label><Input value={settings.tagline || ''} onChange={(e) => update({ tagline: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>{t('admin.logoUrl')}</Label><Input value={settings.logo_url || ''} onChange={(e) => update({ logo_url: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>{t('admin.faviconUrl')}</Label><Input value={settings.favicon_url || ''} onChange={(e) => update({ favicon_url: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>{t('admin.primaryColor')}</Label><div className="flex gap-2"><Input type="color" value={settings.primary_color} onChange={(e) => update({ primary_color: e.target.value })} className="w-12 h-10 p-1" /><Input value={settings.primary_color} onChange={(e) => update({ primary_color: e.target.value })} /></div></div>
          <div className="space-y-1.5"><Label>{t('admin.defaultTheme')}</Label><Select value={settings.default_theme} onValueChange={(v) => update({ default_theme: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dark">Dark</SelectItem><SelectItem value="light">Light</SelectItem></SelectContent></Select></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>{t('admin.homepageBanner')}</Label><Input value={settings.homepage_banner_url || ''} onChange={(e) => update({ homepage_banner_url: e.target.value })} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t('admin.seo')}</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5"><Label>{t('admin.seoTitle')}</Label><Input value={settings.seo_title || ''} onChange={(e) => update({ seo_title: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>{t('admin.seoDescription')}</Label><Textarea value={settings.seo_description || ''} onChange={(e) => update({ seo_description: e.target.value })} rows={2} /></div>
          <div className="space-y-1.5"><Label>{t('admin.googleAnalyticsId')}</Label><Input value={settings.google_analytics_id || ''} onChange={(e) => update({ google_analytics_id: e.target.value })} placeholder="G-XXXXXXX" /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t('admin.integrations')}</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>{t('admin.smtpHost')}</Label><Input value={settings.smtp_host || ''} onChange={(e) => update({ smtp_host: e.target.value })} placeholder="smtp.gmail.com" /></div>
          <div className="space-y-1.5"><Label>{t('admin.telegramBotToken')}</Label><Input type="password" value={settings.telegram_bot_token || ''} onChange={(e) => update({ telegram_bot_token: e.target.value })} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t('admin.general')}</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>{t('admin.defaultLanguage')}</Label><Input value={settings.default_language} onChange={(e) => update({ default_language: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>{t('admin.timezone')}</Label><Input value={settings.timezone} onChange={(e) => update({ timezone: e.target.value })} /></div>
          <div className="flex items-center gap-2 sm:col-span-2 pt-2"><Switch checked={settings.maintenance_mode} onCheckedChange={(c) => update({ maintenance_mode: c })} /><Label>{t('admin.maintenanceMode')}</Label></div>
        </CardContent>
      </Card>
    </div>
  );
}
