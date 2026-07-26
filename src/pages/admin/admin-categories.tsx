import { useEffect, useState } from 'react';
import { supabase, type Category } from '@/lib/supabase';
import { useI18n } from '@/hooks/use-i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

type CatForm = Partial<Category>;
const EMPTY: CatForm = { name: '', slug: '', description: '', icon: '', color: '#3b82f6', sort_order: 0, is_active: true };

export function AdminCategories() {
  const { t } = useI18n();
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CatForm>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCats((data as Category[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const openNew = () => { setEditing(null); setForm({ ...EMPTY }); setDialogOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ ...c }); setDialogOpen(true); };

  const save = async () => {
    if (!form.name) { toast.error(`${t('admin.name')} *`); return; }
    setSaving(true);
    const slug = form.slug || slugify(form.name);
    const payload = { ...form, slug };
    if (editing) {
      const { error } = await supabase.from('categories').update(payload).eq('id', editing.id);
      if (error) toast.error(error.message); else toast.success('OK');
    } else {
      const { error } = await supabase.from('categories').insert(payload);
      if (error) toast.error(error.message); else toast.success('OK');
    }
    setSaving(false);
    setDialogOpen(false);
    load();
  };

  const remove = async (c: Category) => {
    if (!confirm(`${t('admin.confirmDelete')} "${c.name}"?`)) return;
    const { error } = await supabase.from('categories').delete().eq('id', c.id);
    if (error) toast.error(error.message); else { toast.success('OK'); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.categories')}</h1>
          <p className="text-muted-foreground text-sm">{cats.length} {t('admin.categoriesDesc')}</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> {t('admin.newCategory')}</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-24 rounded-xl shimmer" />))}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cats.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: (c.color || '#3b82f6') + '22' }}>
                  <div className="h-4 w-4 rounded" style={{ background: c.color || '#3b82f6' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{c.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{c.slug}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => remove(c)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? t('admin.editCategory') : t('admin.newCategory')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>{t('admin.name')} *</Label><Input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} /></div>
            <div className="space-y-1.5"><Label>{t('admin.slug')}</Label><Input value={form.slug || ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>{t('admin.description')}</Label><Textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>{t('admin.color')}</Label><div className="flex gap-2"><Input type="color" value={form.color || '#3b82f6'} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-12 h-10 p-1" /><Input value={form.color || ''} onChange={(e) => setForm({ ...form, color: e.target.value })} /></div></div>
              <div className="space-y-1.5"><Label>{t('admin.sortOrder')}</Label><Input type="number" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={!!form.is_active} onCheckedChange={(c) => setForm({ ...form, is_active: c })} /><Label>{t('admin.active')}</Label></div>
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
