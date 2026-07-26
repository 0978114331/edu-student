import { useEffect, useState } from 'react';
import { supabase, type Provider } from '@/lib/supabase';
import { useI18n } from '@/hooks/use-i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Key } from 'lucide-react';

type ProvForm = Partial<Provider>;
const EMPTY: ProvForm = {
  name: '', slug: '', description: '', api_key: '', base_url: '', model: '',
  temperature: 0.7, max_tokens: 2048, status: 'active',
};

export function AdminProviders() {
  const { t } = useI18n();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Provider | null>(null);
  const [form, setForm] = useState<ProvForm>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('providers').select('*').order('created_at');
    setProviders((data as Provider[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const openNew = () => { setEditing(null); setForm({ ...EMPTY }); setDialogOpen(true); };
  const openEdit = (p: Provider) => { setEditing(p); setForm({ ...p }); setDialogOpen(true); };

  const save = async () => {
    if (!form.name) { toast.error(`${t('admin.name')} *`); return; }
    setSaving(true);
    const slug = form.slug || slugify(form.name);
    const payload = { ...form, slug, temperature: Number(form.temperature), max_tokens: Number(form.max_tokens) };
    if (editing) {
      const { error } = await supabase.from('providers').update(payload).eq('id', editing.id);
      if (error) toast.error(error.message); else toast.success('OK');
    } else {
      const { error } = await supabase.from('providers').insert(payload);
      if (error) toast.error(error.message); else toast.success('OK');
    }
    setSaving(false);
    setDialogOpen(false);
    load();
  };

  const remove = async (p: Provider) => {
    if (!confirm(`${t('admin.confirmDelete')} "${p.name}"?`)) return;
    const { error } = await supabase.from('providers').delete().eq('id', p.id);
    if (error) toast.error(error.message); else { toast.success('OK'); load(); }
  };

  const toggleStatus = async (p: Provider) => {
    await supabase.from('providers').update({ status: p.status === 'active' ? 'inactive' : 'active' }).eq('id', p.id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.providers')}</h1>
          <p className="text-muted-foreground text-sm">{t('admin.providersDesc')}</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> {t('admin.newProvider')}</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-32 rounded-xl shimmer" />))}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {providers.map((p) => (
            <Card key={p.id}>
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Key className="h-5 w-5 text-primary" /></div>
                    <div>
                      <h3 className="font-semibold text-sm">{p.name}</h3>
                      <p className="text-xs text-muted-foreground">{p.model || '—'}</p>
                    </div>
                  </div>
                  <Badge variant={p.status === 'active' ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => toggleStatus(p)}>{p.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{p.description || '—'}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t('admin.temperature')}: {p.temperature} · {t('admin.maxTokens')}: {p.max_tokens}</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(p)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? t('admin.editProvider') : t('admin.newProvider')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>{t('admin.name')} *</Label><Input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} /></div>
            <div className="space-y-1.5"><Label>{t('admin.description')}</Label><Textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>{t('admin.baseUrl')}</Label><Input value={form.base_url || ''} onChange={(e) => setForm({ ...form, base_url: e.target.value })} placeholder="https://api..." /></div>
              <div className="space-y-1.5"><Label>{t('admin.model')}</Label><Input value={form.model || ''} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="gpt-4o" /></div>
            </div>
            <div className="space-y-1.5"><Label>{t('admin.apiKey')}</Label><Input type="password" value={form.api_key || ''} onChange={(e) => setForm({ ...form, api_key: e.target.value })} placeholder="sk-..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>{t('admin.temperature')}</Label><Input type="number" step="0.1" min="0" max="2" value={form.temperature ?? 0.7} onChange={(e) => setForm({ ...form, temperature: Number(e.target.value) })} /></div>
              <div className="space-y-1.5"><Label>{t('admin.maxTokens')}</Label><Input type="number" value={form.max_tokens ?? 2048} onChange={(e) => setForm({ ...form, max_tokens: Number(e.target.value) })} /></div>
            </div>
            <div className="space-y-1.5"><Label>{t('admin.status')}</Label>
              <Select value={form.status || 'active'} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="active">{t('admin.active')}</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('admin.cancel')}</Button>
            <Button onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editing ? t('admin.save') : t('admin.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
