import { useEffect, useState } from 'react';
import { supabase, type AITool, type Category } from '@/lib/supabase';
import { useI18n } from '@/hooks/use-i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Copy, Archive, Eye, EyeOff, Search, Star, Crown, Sparkles, Loader2 } from 'lucide-react';

type ToolForm = Partial<AITool>;

const EMPTY: ToolForm = {
  name: '', slug: '', short_description: '', full_description: '', category_id: null,
  tags: [], developer_name: '', version: '', icon_url: '', thumbnail_url: '', banner_url: '',
  website_url: '', documentation_url: '', github_url: '', demo_url: '', link_type: 'external',
  pricing_type: 'free', status: 'active', is_featured: false, is_popular: false, is_premium: false,
  is_published: true, is_archived: false, language: 'en',
};

export function AdminTools() {
  const { t } = useI18n();
  const [tools, setTools] = useState<AITool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editing, setEditing] = useState<AITool | null>(null);
  const [form, setForm] = useState<ToolForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tagsInput, setTagsInput] = useState('');

  const load = async () => {
    setLoading(true);
    const [tl, c] = await Promise.all([
      supabase.from('ai_tools').select('*, category:categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    setTools((tl.data as AITool[]) || []);
    setCategories((c.data as Category[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = tools.filter((tl) => {
    if (query) {
      const q = query.toLowerCase();
      if (!tl.name.toLowerCase().includes(q) && !tl.slug.includes(q)) return false;
    }
    if (statusFilter === 'published' && !tl.is_published) return false;
    if (statusFilter === 'archived' && !tl.is_archived) return false;
    if (statusFilter === 'featured' && !tl.is_featured) return false;
    if (statusFilter === 'premium' && !tl.is_premium) return false;
    return true;
  });

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const openNew = () => { setEditing(null); setForm({ ...EMPTY }); setTagsInput(''); setDialogOpen(true); };
  const openEdit = (tl: AITool) => { setEditing(tl); setForm({ ...tl }); setTagsInput(tl.tags.join(', ')); setDialogOpen(true); };

  const save = async () => {
    if (!form.name) { toast.error(`${t('admin.name')} *`); return; }
    setSaving(true);
    const tags = tagsInput.split(',').map((s) => s.trim()).filter(Boolean);
    const slug = form.slug || slugify(form.name);
    const payload = { ...form, slug, tags };
    if (editing) {
      const { error } = await supabase.from('ai_tools').update(payload).eq('id', editing.id);
      if (error) toast.error(error.message); else toast.success('OK');
    } else {
      const { error } = await supabase.from('ai_tools').insert(payload);
      if (error) toast.error(error.message); else toast.success('OK');
    }
    setSaving(false);
    setDialogOpen(false);
    load();
  };

  const duplicate = async (tl: AITool) => {
    const { id, created_at, updated_at, stats_views, stats_clicks, stats_favorites, stats_shares, stats_downloads, stats_rating_sum, stats_rating_count, ...rest } = tl as any;
    const copy = { ...rest, name: `${tl.name} (Copy)`, slug: slugify(`${tl.name}-copy`) };
    const { error } = await supabase.from('ai_tools').insert(copy);
    if (error) toast.error(error.message); else { toast.success('OK'); load(); }
  };

  const togglePublish = async (tl: AITool) => { await supabase.from('ai_tools').update({ is_published: !tl.is_published }).eq('id', tl.id); load(); };
  const toggleArchive = async (tl: AITool) => { await supabase.from('ai_tools').update({ is_archived: !tl.is_archived }).eq('id', tl.id); load(); };
  const toggleFlag = async (tl: AITool, flag: 'is_featured' | 'is_popular' | 'is_premium') => { await supabase.from('ai_tools').update({ [flag]: !tl[flag] }).eq('id', tl.id); load(); };

  const remove = async (tl: AITool) => {
    if (!confirm(`${t('admin.confirmDelete')} "${tl.name}"?`)) return;
    const { error } = await supabase.from('ai_tools').delete().eq('id', tl.id);
    if (error) toast.error(error.message); else { toast.success('OK'); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.tools')}</h1>
          <p className="text-muted-foreground text-sm">{tools.length} {t('admin.toolsDesc')}</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> {t('admin.newTool')}</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('tools.searchPlaceholder')} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('tools.all')}</SelectItem>
            <SelectItem value="published">{t('admin.published')}</SelectItem>
            <SelectItem value="archived">{t('admin.archived')}</SelectItem>
            <SelectItem value="featured">{t('admin.featured')}</SelectItem>
            <SelectItem value="premium">{t('admin.premium')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-3">{Array.from({ length: 5 }).map((_, i) => (<div key={i} className="h-12 rounded shimmer" />))}</div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((tl) => (
                <div key={tl.id} className="flex items-center gap-3 p-3 hover:bg-muted/30">
                  <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {tl.icon_url ? <img src={tl.icon_url} alt={tl.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-primary font-bold">{tl.name[0]}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{tl.name}</span>
                      {tl.is_featured && <Sparkles className="h-3 w-3 text-primary" />}
                      {tl.is_premium && <Crown className="h-3 w-3 text-warning" />}
                      {tl.is_archived && <Badge variant="secondary">{t('admin.archived')}</Badge>}
                      {!tl.is_published && <Badge variant="destructive">{t('admin.published')}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{tl.category?.name || t('admin.uncategorized')} · {tl.pricing_type}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => toggleFlag(tl, 'is_featured')} title={t('admin.featured')}>
                      <Star className={`h-4 w-4 ${tl.is_featured ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => togglePublish(tl)} title={t('admin.published')}>
                      {tl.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => toggleArchive(tl)} title={t('admin.archived')}><Archive className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => duplicate(tl)} title="Copy"><Copy className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(tl)} title={t('admin.editTool')}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(tl)} title={t('admin.delete')} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">{t('tools.noMatch')}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? t('admin.editTool') : t('admin.newTool')}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>{t('admin.name')} *</Label><Input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} /></div>
            <div className="space-y-1.5"><Label>{t('admin.slug')}</Label><Input value={form.slug || ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto" /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>{t('admin.shortDescription')}</Label><Input value={form.short_description || ''} onChange={(e) => setForm({ ...form, short_description: e.target.value })} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>{t('admin.fullDescription')}</Label><Textarea value={form.full_description || ''} onChange={(e) => setForm({ ...form, full_description: e.target.value })} rows={4} /></div>
            <div className="space-y-1.5"><Label>{t('nav.categories')}</Label>
              <Select value={form.category_id || 'none'} onValueChange={(v) => setForm({ ...form, category_id: v === 'none' ? null : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}<SelectItem value="none">{t('admin.none')}</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>{t('admin.developer')}</Label><Input value={form.developer_name || ''} onChange={(e) => setForm({ ...form, developer_name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>{t('admin.version')}</Label><Input value={form.version || ''} onChange={(e) => setForm({ ...form, version: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>{t('admin.pricingType')}</Label>
              <Select value={form.pricing_type || 'free'} onValueChange={(v) => setForm({ ...form, pricing_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="free">{t('tools.free')}</SelectItem><SelectItem value="freemium">Freemium</SelectItem><SelectItem value="paid">Paid</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>{t('admin.linkType')}</Label>
              <Select value={form.link_type || 'external'} onValueChange={(v) => setForm({ ...form, link_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="external">External</SelectItem><SelectItem value="internal">Internal</SelectItem><SelectItem value="modal">Modal</SelectItem><SelectItem value="iframe">iframe</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2"><Label>{t('admin.tags')}</Label><Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="ai, assistant, chat" /></div>
            <div className="space-y-1.5"><Label>{t('admin.iconUrl')}</Label><Input value={form.icon_url || ''} onChange={(e) => setForm({ ...form, icon_url: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>{t('admin.thumbnailUrl')}</Label><Input value={form.thumbnail_url || ''} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>{t('admin.bannerUrl')}</Label><Input value={form.banner_url || ''} onChange={(e) => setForm({ ...form, banner_url: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>{t('admin.websiteUrl')}</Label><Input value={form.website_url || ''} onChange={(e) => setForm({ ...form, website_url: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>{t('admin.documentationUrl')}</Label><Input value={form.documentation_url || ''} onChange={(e) => setForm({ ...form, documentation_url: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>{t('admin.githubUrl')}</Label><Input value={form.github_url || ''} onChange={(e) => setForm({ ...form, github_url: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>{t('admin.demoUrl')}</Label><Input value={form.demo_url || ''} onChange={(e) => setForm({ ...form, demo_url: e.target.value })} /></div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2 border-t border-border">
            {([['is_published', t('admin.published')], ['is_featured', t('admin.featured')], ['is_popular', t('admin.popular')], ['is_premium', t('admin.premium')], ['is_archived', t('admin.archived')]] as const).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <Switch checked={!!form[key]} onCheckedChange={(c) => setForm({ ...form, [key]: c })} />
                <Label className="text-sm">{label}</Label>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('admin.cancel')}</Button>
            <Button onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editing ? t('admin.saveChanges') : t('admin.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
