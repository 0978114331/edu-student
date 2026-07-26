import { useEffect, useState } from 'react';
import { supabase, type Resource, type Category } from '@/lib/supabase';
import { useI18n } from '@/hooks/use-i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';

type ResForm = Partial<Resource>;
const EMPTY: ResForm = {
  title: '', slug: '', description: '', category_id: null, resource_type: 'article',
  thumbnail_url: '', url: '', author: '', tags: [], is_premium: false, status: 'published',
};
const TYPES = ['course', 'book', 'pdf', 'video', 'documentation', 'github', 'website', 'template'];

export function AdminResources() {
  const { t } = useI18n();
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [form, setForm] = useState<ResForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [tagsInput, setTagsInput] = useState('');

  const load = async () => {
    setLoading(true);
    const [r, c] = await Promise.all([
      supabase.from('resources').select('*, category:categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    setResources((r.data as Resource[]) || []);
    setCategories((c.data as Category[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const filtered = resources.filter((r) => !query || r.title.toLowerCase().includes(query.toLowerCase()));

  const openNew = () => { setEditing(null); setForm({ ...EMPTY }); setTagsInput(''); setDialogOpen(true); };
  const openEdit = (r: Resource) => { setEditing(r); setForm({ ...r }); setTagsInput(r.tags.join(', ')); setDialogOpen(true); };

  const save = async () => {
    if (!form.title) { toast.error(`${t('admin.title')} *`); return; }
    setSaving(true);
    const tags = tagsInput.split(',').map((s) => s.trim()).filter(Boolean);
    const slug = form.slug || slugify(form.title);
    const payload = { ...form, slug, tags };
    if (editing) {
      const { error } = await supabase.from('resources').update(payload).eq('id', editing.id);
      if (error) toast.error(error.message); else toast.success('OK');
    } else {
      const { error } = await supabase.from('resources').insert(payload);
      if (error) toast.error(error.message); else toast.success('OK');
    }
    setSaving(false);
    setDialogOpen(false);
    load();
  };

  const remove = async (r: Resource) => {
    if (!confirm(`${t('admin.confirmDelete')} "${r.title}"?`)) return;
    const { error } = await supabase.from('resources').delete().eq('id', r.id);
    if (error) toast.error(error.message); else { toast.success('OK'); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.resources')}</h1>
          <p className="text-muted-foreground text-sm">{resources.length} {t('admin.resourcesDesc')}</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> {t('admin.newResource')}</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('resources.searchPlaceholder')} className="pl-10 max-w-md" />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-3">{Array.from({ length: 5 }).map((_, i) => (<div key={i} className="h-12 rounded shimmer" />))}</div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-3 hover:bg-muted/30">
                  <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {r.thumbnail_url ? <img src={r.thumbnail_url} alt={r.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">{r.resource_type[0].toUpperCase()}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{r.title}</span>
                      {r.is_premium && <Badge className="bg-warning/90 text-warning-foreground">{t('admin.premium')}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{r.category?.name || t('admin.uncategorized')} · {r.resource_type}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(r)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">{t('resources.noResults')}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? t('admin.editResource') : t('admin.newResource')}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2"><Label>{t('admin.title')} *</Label><Input value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} /></div>
            <div className="space-y-1.5"><Label>{t('admin.slug')}</Label><Input value={form.slug || ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>{t('admin.type')}</Label>
              <Select value={form.resource_type || 'article'} onValueChange={(v) => setForm({ ...form, resource_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map((tp) => (<SelectItem key={tp} value={tp} className="capitalize">{tp}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2"><Label>{t('admin.description')}</Label><Textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div className="space-y-1.5"><Label>{t('nav.categories')}</Label>
              <Select value={form.category_id || 'none'} onValueChange={(v) => setForm({ ...form, category_id: v === 'none' ? null : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}<SelectItem value="none">{t('admin.none')}</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>{t('admin.author')}</Label><Input value={form.author || ''} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>{t('admin.url')}</Label><Input value={form.url || ''} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>{t('admin.thumbnailUrl')}</Label><Input value={form.thumbnail_url || ''} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>{t('admin.tags')}</Label><Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} /></div>
            <div className="flex items-center gap-2"><Switch checked={!!form.is_premium} onCheckedChange={(c) => setForm({ ...form, is_premium: c })} /><Label>{t('admin.premium')}</Label></div>
            <div className="space-y-1.5"><Label>{t('admin.status')}</Label>
              <Select value={form.status || 'published'} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="published">{t('admin.published')}</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent>
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
